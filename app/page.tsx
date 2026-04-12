import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/app/auth-actions";

export default async function Home() {
  const session = await auth();

  return (
    <main className="page-shell">
      <section className="panel">
        <h1 className="panel-title">Izmenjevalni pogled</h1>
        <p className="panel-subtitle">Enostaven auth flow z lokalno in Google prijavo.</p>

        {session?.user ? (
          <>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Prijavljen uporabnik</span>
                <span className="info-value">
                  {session.user.name ?? session.user.email ?? "Uporabnik"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{session.user.email ?? "Ni na voljo"}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link className="btn btn-primary" href="/profile">
                Poglej profil
              </Link>
            </div>

            <form action={logoutAction}>
              <button className="btn btn-ghost" type="submit">
                Odjava
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-primary" href="/login">
              Prijava
            </Link>
            <Link className="btn btn-secondary" href="/register">
              Registracija
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
