import Link from "next/link";
import { loginAction, googleLoginAction } from "@/app/auth-actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing_fields":
      return "Izpolni email in geslo.";
    case "invalid_credentials":
      return "Napacen email ali geslo.";
    default:
      return "";
  }
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="page-shell">
      <section className="panel">
        <h1 className="panel-title">Prijava</h1>
        <p className="panel-subtitle">Dostop do tvojega racuna.</p>

        {errorMessage ? <p className="message message-error">{errorMessage}</p> : null}

        <form action={loginAction} className="form-stack">
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input className="field-input" id="email" name="email" type="email" required />

          <label className="field-label" htmlFor="password">
            Geslo
          </label>
          <input
            className="field-input"
            id="password"
            name="password"
            type="password"
            required
          />

          <button className="btn btn-primary mt-2" type="submit">
            Prijava
          </button>
        </form>

        <form action={googleLoginAction}>
          <button className="btn btn-secondary" type="submit">
            Prijava z Google
          </button>
        </form>

        <p className="muted-text text-sm">
          Nimas racuna?{" "}
          <Link className="muted-link" href="/register">
            Registracija
          </Link>
        </p>
      </section>
    </main>
  );
}
