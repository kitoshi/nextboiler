// src/auth.ts
import { Lucia, Session, User } from 'lucia';
import { NeonHTTPAdapter } from '@lucia-auth/adapter-postgresql';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import { cache } from 'react';

if (process.env.DATABASE_URL === undefined) {
  throw new Error(`Env Variable ${process.env.DATABASE_URL} undefined.`);
}

export const sql = neon(process.env.DATABASE_URL);

const adapter = new NeonHTTPAdapter(sql, {
  user: 'auth_user',
  session: 'user_session'
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      username: attributes.username
    };
  }
});

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}
    return result;
  }
);

// IMPORTANT!
declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
}

export type UserInfo = {
  username: string;
  password: string;
  id: string;
};
