import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { UserRole } from "@/generated/prisma/browser";

export const SESSION_COOKIE = "biomaternal_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export interface SessionJwtPayload extends JWTPayload {
	email: string;
	username: string;
	role: UserRole;
}

export interface SessionTokenInput {
	sub: string;
	email: string;
	username: string;
	role: UserRole;
}

function parsePayload(value: unknown): SessionJwtPayload | null {
	if (!value || typeof value !== "object") return null;

	const payload = value as Partial<SessionJwtPayload>;
	if (
		typeof payload.sub !== "string" ||
		typeof payload.email !== "string" ||
		typeof payload.username !== "string" ||
		typeof payload.role !== "string"
	) {
		return null;
	}

	return payload as SessionJwtPayload;
}

function getSessionSecret() {
	const secret =
		process.env.SESSION_JWT_SECRET ??
		process.env.AUTH_SECRET ??
		process.env.NEXTAUTH_SECRET ??
		(process.env.NODE_ENV !== "production" ? "biomaternal-backoffice-dev-session-secret" : undefined);

	if (!secret) {
		throw new Error(
			"SESSION_JWT_SECRET (or AUTH_SECRET / NEXTAUTH_SECRET) is not configured. Refusing to start with an unsigned/dummy session secret in production.",
		);
	}

	return secret;
}


function getSessionSecretKey() {
	return new TextEncoder().encode(getSessionSecret());
}

export async function createSessionToken(payload: SessionTokenInput) {
	return new SignJWT({ email: payload.email, username: payload.username, role: payload.role })
		.setProtectedHeader({ alg: "HS256", typ: "JWT" })
		.setSubject(payload.sub)
		.setIssuedAt()
		.setExpirationTime(`${SESSION_TTL_SECONDS}s`)
		.sign(getSessionSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionJwtPayload | null> {
	try {
		const { payload } = await jwtVerify(token, getSessionSecretKey(), {
			algorithms: ["HS256"],
		});

		const session = parsePayload(payload);
		if (!session || typeof payload.sub !== "string") return null;

		return {
			sub: payload.sub,
			email: session.email,
			username: session.username,
			role: session.role,
			iat: typeof payload.iat === "number" ? payload.iat : undefined,
			exp: typeof payload.exp === "number" ? payload.exp : undefined,
		};
	} catch {
		return null;
	}
}
