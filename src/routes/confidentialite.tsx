import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/TopBar";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [{ title: "Confidentialité · Ferasha Quantic" }],
  }),
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <div className="min-h-screen pb-12">
      <TopBar />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 text-sm leading-relaxed">
        <h1 className="font-display text-2xl font-bold">Politique de confidentialité</h1>
        <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          Modèle générique, à faire relire par un professionnel du droit avant mise en production.
          Rédigé dans l'esprit de la loi marocaine 09-08 relative à la protection des données à
          caractère personnel ; à adapter si la plateforme cible d'autres juridictions (ex. RGPD).
        </p>

        <section>
          <h2 className="font-display text-lg font-semibold">Responsable du traitement</h2>
          <p className="mt-2">[Raison sociale], contact : [email dédié à la protection des données].</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Données collectées</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Compte : email, mot de passe (chiffré), nom complet, ville, téléphone.</li>
            <li>Vitrine (Ferasha) : nom commercial, catégorie, ville, coordonnées de contact publiées volontairement (WhatsApp, téléphone, email, réseaux sociaux).</li>
            <li>Avis clients : note, commentaire, identité de l'auteur (non anonyme).</li>
            <li>Usage : nombre de vues d'une Ferasha, horodatage de création/modification.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Finalités</h2>
          <p className="mt-2">
            Création et gestion des comptes, mise en relation entre visiteurs et professionnels,
            affichage public des vitrines et de leurs avis, statistiques d'usage agrégées, sécurité
            de la plateforme (prévention de la fraude et des abus).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Base légale et conservation</h2>
          <p className="mt-2">
            Exécution du contrat d'utilisation de la plateforme et intérêt légitime (sécurité, amélioration
            du service). Les données sont conservées pendant toute la durée de vie du compte, puis supprimées
            ou anonymisées dans un délai raisonnable après sa clôture, sauf obligation légale de conservation
            plus longue.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Partage des données</h2>
          <p className="mt-2">
            Les données techniques sont hébergées chez Supabase Inc. (base de données, authentification,
            stockage des fichiers) et chez [prestataire d'hébergement web]. Aucune donnée n'est vendue à des
            tiers. Les coordonnées publiées sur une Ferasha (WhatsApp, téléphone, etc.) sont visibles par tout
            visiteur du site, à l'initiative du professionnel qui les renseigne.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Droits des personnes</h2>
          <p className="mt-2">
            Conformément à la réglementation applicable, toute personne dispose d'un droit d'accès, de
            rectification, d'opposition et de suppression de ses données. Ces droits peuvent être exercés en
            écrivant à [email de contact] ou directement depuis les paramètres du compte lorsque disponible.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Sécurité</h2>
          <p className="mt-2">
            L'accès aux données est protégé par des politiques de sécurité au niveau de la base de données
            (Row Level Security) : chaque utilisateur ne peut lire ou modifier que les données auxquelles son
            rôle lui donne accès. Les mots de passe sont chiffrés et jamais stockés en clair.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Voir aussi nos <a href="/mentions-legales" className="underline">mentions légales</a>.
        </p>
      </main>
    </div>
  );
}
