import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Eliminación de datos",
  description: "Instrucciones para solicitar a AgenteFactory la eliminación de datos asociados a WhatsApp y sus servicios de IA.",
  alternates: { canonical: "/data-deletion" },
  openGraph: {
    title: "Eliminación de datos | AgenteFactory",
    description: "Cómo solicitar la eliminación de datos tratados por AgenteFactory.",
    type: "website",
    url: `${siteConfig.baseUrl}/data-deletion`,
  },
};

const sections = [
  {
    title: "Cómo enviar la solicitud",
    items: [
      "Escribe a bermudez.ferris@gmail.com desde un correo al que tengas acceso.",
      "Usa el asunto: Solicitud de eliminación de datos.",
      "Incluye tu nombre, el número de WhatsApp completo con código de país y una descripción breve de los datos o conversaciones que deseas eliminar.",
      "No envíes contraseñas, códigos de autenticación, documentos de identidad completos ni información sensible innecesaria.",
    ],
  },
  {
    title: "Verificación y trámite",
    paragraphs: [
      "Confirmaremos la recepción y podremos solicitar información limitada para comprobar que la petición corresponde al titular del número o a una persona autorizada. Esto ayuda a impedir eliminaciones fraudulentas de datos de terceros.",
      "Una vez verificada la solicitud, eliminaremos o anonimizaremos los datos personales bajo control de AgenteFactory que estén vinculados con el alcance solicitado, incluyendo cuando corresponda contactos, conversaciones, mensajes, resúmenes y memoria persistente.",
    ],
  },
  {
    title: "Excepciones y proveedores",
    paragraphs: [
      "Podremos conservar información mínima cuando sea necesaria para cumplir una obligación legal, resolver disputas, prevenir fraude o demostrar que la solicitud fue atendida. Informaremos si una excepción aplicable impide eliminar algún dato.",
      "La solicitud cubre los datos controlados por AgenteFactory. Meta, WhatsApp, OpenAI, Supabase u otros proveedores pueden conservar registros propios conforme a sus términos, obligaciones y políticas; cuando corresponda, te indicaremos si debes ejercer una solicitud directamente ante ellos.",
    ],
  },
  {
    title: "Alternativas disponibles",
    paragraphs: [
      "También puedes solicitar acceso, corrección o limitación del uso de tus datos mediante el mismo correo. Si solo deseas dejar de recibir mensajes, indícalo expresamente para que podamos atender esa preferencia sin eliminar necesariamente todo el historial.",
    ],
  },
] as const;

export default function DataDeletionPage() {
  return (
    <LegalPage
      eyebrow="Datos personales"
      title="Solicitud de eliminación de datos"
      introduction="Puedes pedir que eliminemos los datos personales vinculados con tus interacciones con AgenteFactory siguiendo estas instrucciones."
      sections={[...sections]}
    />
  );
}
