import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { changePasswordAction, logoutAction } from "@/app/auth-actions";
import prisma from "@/lib/prisma";

type Props = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing_fields":
      return "Izpolni vsa polja.";
    case "password_too_short":
      return "Novo geslo mora imeti vsaj 8 znakov.";
    case "password_mismatch":
      return "Novo geslo in potrditev se ne ujemata.";
    case "invalid_current_password":
      return "Trenutno geslo ni pravilno.";
    case "google_account":
      return "Za Google racun menjava gesla ni podprta.";
    default:
      return "";
  }
}

function getSuccessMessage(success?: string) {
  if (success === "password_updated") {
    return "Geslo je bilo uspesno posodobljeno.";
  }
  return "";
}

export default async function ProfilePage({ searchParams }: Props) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: { provider: "google" },
        select: { id: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);
  const successMessage = getSuccessMessage(params?.success);
  const hasGoogleAccount = user.accounts.length > 0;

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="panel-header">
          <h1 className="panel-title">Profil</h1>
          <Link className="muted-link" href="/">
            Nazaj domov
          </Link>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Ime</span>
            <span className="info-value">{user.name ?? "Ni nastavljeno"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Nacin prijave</span>
            <span className="info-value">
              {hasGoogleAccount ? "Google OAuth" : "Email in geslo"}
            </span>
          </div>
        </div>

        {errorMessage ? <p className="message message-error">{errorMessage}</p> : null}
        {successMessage ? (
          <p className="message message-success">{successMessage}</p>
        ) : null}

        {hasGoogleAccount ? (
          <p className="muted-text">
            Ker je racun povezan z Google prijavo, menjava gesla tukaj ni na voljo.
          </p>
        ) : (
          <form action={changePasswordAction} className="form-stack">
            <h2 className="section-title">Menjava gesla</h2>
            <label className="field-label" htmlFor="currentPassword">
              Trenutno geslo
            </label>
            <input
              className="field-input"
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />

            <label className="field-label" htmlFor="newPassword">
              Novo geslo
            </label>
            <input
              className="field-input"
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={8}
              required
            />

            <label className="field-label" htmlFor="confirmPassword">
              Potrdi novo geslo
            </label>
            <input
              className="field-input"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              required
            />

            <button className="btn btn-primary mt-2" type="submit">
              Posodobi geslo
            </button>
          </form>
        )}

        <form action={logoutAction}>
          <button className="btn btn-ghost w-full" type="submit">
            Odjava
          </button>
        </form>
      </section>
    </main>
  );
}
