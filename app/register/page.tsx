import Link from "next/link";
import { registerAction } from "@/app/auth-actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing_fields":
      return "Izpolni vsa obvezna polja.";
    case "password_too_short":
      return "Geslo mora imeti vsaj 8 znakov.";
    case "email_exists":
      return "Ta email je ze registriran.";
    default:
      return "";
  }
}

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="page-shell">
      <section className="panel">
        <h1 className="panel-title">Registracija</h1>
        <p className="panel-subtitle">Ustvari nov racun v nekaj sekundah.</p>

        {errorMessage ? <p className="message message-error">{errorMessage}</p> : null}

        <form action={registerAction} className="form-stack">
          <label className="field-label" htmlFor="name">
            Ime
          </label>
          <input className="field-input" id="name" name="name" />

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
            minLength={8}
            required
          />

          <button className="btn btn-primary mt-2" type="submit">
            Ustvari racun
          </button>
        </form>

        <p className="muted-text text-sm">
          Ze imas racun?{" "}
          <Link className="muted-link" href="/login">
            Prijava
          </Link>
        </p>
      </section>
    </main>
  );
}
