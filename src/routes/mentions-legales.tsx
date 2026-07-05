import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [{ title: "Mentions légales · Ferasha Quantic" }],
  }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <div className="min-h-screen pb-12">
      <TopBar />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 text-sm leading-relaxed">
        <h1 className="font-display text-2xl font-bold">Mentions légales</h1>
        <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          Modèle générique à faire relire par un professionnel du droit avant mise en production —
          remplace les champs entre crochets par les informations réelles de l'entreprise.
        </p>

        <section>
          <h2 className="font-display text-lg font-semibold">Éditeur du site</h2>
          <p className="mt-2">
            Le site Ferasha Quantic est édité par [Raison sociale / nom de l'entreprise], [forme juridique],
            au capital de [montant] DH, immatriculée au registre du commerce de [ville] sous le numéro [RC],
            dont le siège social est situé au [adresse complète].<br />
            Numéro d'identification fiscale : [IF] — Numéro ICE : [ICE].<br />
            Responsable de la publication : [Nom, prénom, qualité].<br />
            Contact : [email] — [téléphone].
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Hébergement</h2>
          <p className="mt-2">
            Base de données et authentification : Supabase Inc., hébergées sur une instance cloud
            (région à préciser dans la configuration du projet).<br />
            Hébergement de l'application web : [Cloudflare / autre prestataire], [adresse du siège du prestataire].
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Propriété intellectuelle</h2>
          <p className="mt-2">
            L'ensemble des éléments du site (textes, structure, identité visuelle) est protégé par le droit
            d'auteur. Le contenu publié par les Ferashas (textes, photos de produits/services) reste la
            propriété de leurs auteurs respectifs, qui garantissent disposer des droits nécessaires à sa
            publication.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Responsabilité</h2>
          <p className="mt-2">
            Ferasha Quantic met en relation des visiteurs et des professionnels référencés ; la plateforme
            n'est pas partie aux transactions conclues entre eux et n'intervient ni dans la vente, ni dans le
            paiement, ni dans la livraison des produits ou services proposés.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Voir aussi notre <a href="/confidentialite" className="underline">politique de confidentialité</a>.
        </p>
      </main>
    </div>
  );
}
