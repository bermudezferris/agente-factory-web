import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Política de privacidad de AgenteFactory para sus servicios de automatización, WhatsApp e inteligencia artificial.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Política de privacidad | AgenteFactory",
    description: "Cómo AgenteFactory recibe, utiliza, almacena y protege datos en sus servicios de automatización e IA.",
    type: "website",
    url: `${siteConfig.baseUrl}/privacy`,
  },
};

const sections = [
  {
    title: "Datos que podemos recibir",
    items: [
      "Nombre, número de teléfono, identificador de WhatsApp y datos de perfil que WhatsApp ponga a disposición del servicio.",
      "Mensajes, archivos o información que la persona decida enviar, junto con fecha, hora y estado de entrega.",
      "Datos comerciales relevantes, necesidades, intereses, acuerdos, citas, pendientes, objeciones y notas de seguimiento o derivación a una persona.",
      "Historial y resúmenes de conversaciones, así como registros técnicos mínimos necesarios para seguridad, diagnóstico y prevención de duplicados.",
    ],
  },
  {
    title: "Para qué usamos la información",
    paragraphs: [
      "Usamos estos datos para recibir y responder consultas, prestar servicios de automatización e inteligencia artificial, mantener el contexto entre conversaciones, coordinar atención humana y dar seguimiento a solicitudes comerciales o de soporte.",
      "También podemos tratarlos para operar, proteger y mejorar el servicio, resolver errores, evitar respuestas duplicadas y cumplir obligaciones legales aplicables. No vendemos los datos personales de los contactos.",
    ],
  },
  {
    title: "Almacenamiento y proveedores tecnológicos",
    paragraphs: [
      "Supabase actúa como infraestructura principal de base de datos; Meta presta WhatsApp Cloud API; OpenAI procesa el contexto necesario para generar o estructurar respuestas; y Hostinger aloja componentes de la aplicación. Cada proveedor trata información conforme a sus propios términos, controles y ubicaciones de infraestructura.",
      "Conservamos la información durante el tiempo razonablemente necesario para prestar el servicio, mantener continuidad y memoria conversacional, atender disputas o cumplir obligaciones. Cuando deja de ser necesaria, procuramos eliminarla o anonimizarla, salvo que exista un deber legítimo de conservación.",
    ],
  },
  {
    title: "Decisiones y contenido generado por IA",
    paragraphs: [
      "Las respuestas pueden ser generadas con inteligencia artificial y pueden contener errores. El usuario puede solicitar atención humana. No utilizamos el agente para adoptar decisiones legales, médicas, crediticias o de similar impacto sin la revisión humana que corresponda.",
    ],
  },
  {
    title: "Derechos y solicitudes",
    paragraphs: [
      "Según la legislación aplicable, puedes solicitar acceso, corrección, actualización, eliminación, oposición o limitación del tratamiento de tus datos. También puedes retirar un consentimiento cuando esa sea la base utilizada, sin afectar tratamientos anteriores legítimos.",
      "Para ejercer un derecho, escribe a bermudez.ferris@gmail.com e indica el número de WhatsApp relacionado y la naturaleza de tu solicitud. Podremos pedir información razonable para verificar identidad y evitar entregar o borrar datos de otra persona.",
    ],
  },
  {
    title: "Seguridad y cambios",
    paragraphs: [
      "Aplicamos controles técnicos y organizativos razonables, aunque ningún sistema conectado a internet puede garantizar seguridad absoluta. Podemos actualizar esta política cuando cambien el servicio, sus proveedores o las obligaciones aplicables; la fecha vigente aparecerá en esta página.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacidad"
      title="Política de privacidad"
      introduction="Esta política explica cómo AgenteFactory trata información cuando una persona interactúa con nuestros canales, incluidos los agentes conectados a WhatsApp Cloud API y OpenAI."
      sections={[...sections]}
    />
  );
}
