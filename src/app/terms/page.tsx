import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Términos de servicio",
  description: "Términos aplicables al uso de los servicios de automatización e inteligencia artificial de AgenteFactory.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Términos de servicio | AgenteFactory",
    description: "Condiciones aplicables al uso de los servicios de automatización e IA de AgenteFactory.",
    type: "website",
    url: `${siteConfig.baseUrl}/terms`,
  },
};

const sections = [
  {
    title: "Aceptación y alcance",
    paragraphs: [
      "Al utilizar un canal o servicio de AgenteFactory, aceptas estos términos y la Política de privacidad. El servicio puede incluir automatización de conversaciones, respuestas generadas por IA, memoria contextual, coordinación comercial y transferencia de la conversación a personal humano.",
    ],
  },
  {
    title: "Uso permitido",
    items: [
      "Proporcionar información veraz y contar con autorización para compartir los datos enviados.",
      "No usar el servicio para fraude, suplantación, acoso, spam, actividades ilícitas o vulneración de derechos de terceros.",
      "No intentar acceder sin autorización, alterar, sobrecargar o interferir con la aplicación o sus proveedores.",
      "Evitar enviar datos sensibles que no sean necesarios para la consulta o servicio solicitado.",
    ],
  },
  {
    title: "Inteligencia artificial y revisión humana",
    paragraphs: [
      "Las respuestas automáticas pueden ser incompletas, inexactas o no adecuarse a un caso particular. No constituyen asesoramiento legal, médico, financiero ni profesional. El usuario debe verificar información importante y puede pedir intervención humana en cualquier momento.",
    ],
  },
  {
    title: "Servicios de terceros",
    paragraphs: [
      "La operación depende de servicios de terceros, entre ellos Meta y WhatsApp Cloud API, OpenAI, Supabase y Hostinger. Interrupciones, cambios o limitaciones de esos proveedores pueden afectar disponibilidad, entrega de mensajes o tiempos de respuesta.",
    ],
  },
  {
    title: "Propiedad intelectual",
    paragraphs: [
      "AgenteFactory conserva sus derechos sobre el sitio, software, identidad, documentación y configuraciones propias. Cada usuario conserva los derechos que le correspondan sobre el contenido que proporciona y declara tener permiso para que sea procesado con el fin de prestar el servicio.",
    ],
  },
  {
    title: "Disponibilidad y responsabilidad",
    paragraphs: [
      "El servicio se ofrece con las capacidades disponibles y puede cambiar, suspenderse o requerir mantenimiento. En la medida permitida por la ley, AgenteFactory no garantiza funcionamiento ininterrumpido ni resultados comerciales específicos y no responde por decisiones tomadas exclusivamente a partir de una respuesta automática.",
    ],
  },
  {
    title: "Terminación y cambios",
    paragraphs: [
      "Podemos limitar o terminar el acceso cuando exista abuso, riesgo de seguridad, incumplimiento o exigencia legal. Podemos actualizar estos términos para reflejar cambios operativos o legales; la versión vigente y su fecha estarán disponibles en esta página.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Condiciones"
      title="Términos de servicio"
      introduction="Estas condiciones regulan el uso de los canales y servicios de automatización e inteligencia artificial operados por AgenteFactory."
      sections={[...sections]}
    />
  );
}
