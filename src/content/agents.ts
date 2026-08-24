export type AgentCollaborator = {
  exchange: string;
  reason: string;
  slug: string;
};

export type AgentScenarioStep = {
  detail: string;
  title: string;
};

export type AgentPortrait = {
  alt: string;
  objectPosition: string;
  src?: string;
};

export type AgentDetail = {
  accent: string;
  cardDescription?: string;
  collaboratesWith: AgentCollaborator[];
  decisionsAndActions: string[];
  diagnosticDefinition: string;
  expectedResults: string[];
  futureIntegrations?: string[];
  headline: string;
  howItWorks: string[];
  humanLimits: string[];
  humanEscalation: string;
  indicators: string[];
  informationSources: string[];
  initials: string;
  metadataDescription: string;
  metadataTitle?: string;
  mission: string;
  name: string;
  personalityLine?: string;
  postActionDeliverables: string[];
  portrait: AgentPortrait;
  priority: "primary" | "secondary";
  problem: string;
  result: string;
  role: string;
  scenario: AgentScenarioStep[];
  signals: string[];
  slug: string;
  tagline: string;
  useCases: string[];
  valueMessage?: {
    body: string;
    title: string;
  };
};

export type AgentSummary = Pick<
  AgentDetail,
  | "accent"
  | "cardDescription"
  | "initials"
  | "name"
  | "portrait"
  | "priority"
  | "result"
  | "role"
  | "slug"
  | "tagline"
>;

export const agents: AgentDetail[] = [
  {
    accent: "linear-gradient(135deg, #ffb27a 0%, #ff7a8a 100%)",
    collaboratesWith: [
      {
        exchange:
          "Le entrega leads ya contextualizados, con intención, urgencia y siguiente paso sugerido.",
        reason:
          "Cuando la conversación empieza como consulta y luego se convierte en oportunidad comercial.",
        slug: "carlos",
      },
      {
        exchange:
          "Comparte reuniones agendadas, compromisos comerciales y tareas posteriores a la propuesta.",
        reason:
          "Cuando una oportunidad aprobada necesita coordinación operativa para avanzar sin fricción.",
        slug: "olivia",
      },
      {
        exchange:
          "Envía actividad comercial, estados de seguimiento y resultados por canal o vendedor.",
        reason:
          "Cuando la empresa necesita saber qué cadencias convierten mejor y dónde se enfrían las oportunidades.",
        slug: "diego",
      },
    ],
    decisionsAndActions: [
      "Organizar y priorizar leads según criterios definidos por la empresa.",
      "Detectar intención, urgencia, presupuesto o encaje comercial cuando esa información está disponible.",
      "Agendar reuniones, activar seguimientos y reactivar oportunidades dormidas.",
      "Actualizar el CRM o el registro comercial con contexto útil para el siguiente paso.",
    ],
    diagnosticDefinition:
      "El Diagnóstico Estratégico de IA define qué criterios de calificación se usarán, qué señales indican prioridad real, en qué momento Valentina agenda, cuándo debe transferir a una persona y qué información debe registrar para no romper el proceso comercial.",
    expectedResults: [
      "Más leads contactados dentro del tiempo objetivo.",
      "Más reuniones agendadas con contexto previo claro.",
      "Menos oportunidades olvidadas entre un mensaje y el siguiente.",
      "Un registro comercial más ordenado para que el vendedor humano llegue preparado.",
    ],
    headline:
      "Convierte leads entrantes en oportunidades trabajadas con criterio, contexto y continuidad comercial.",
    howItWorks: [
      "Recibe leads desde formularios, campañas, WhatsApp, referidos o canales definidos por la empresa.",
      "Verifica datos disponibles, clasifica el contacto y ordena el siguiente paso según reglas de negocio.",
      "Inicia o continúa la conversación comercial con un tono claro, sin dejar seguimientos abiertos indefinidamente.",
      "Agenda, reactiva o transfiere al vendedor humano cuando la oportunidad ya merece intervención directa.",
    ],
    humanEscalation:
      "Escala al equipo humano cuando una negociación exige criterio comercial delicado, aprobación especial, excepción de precios o cierre consultivo de alto valor.",
    humanLimits: [
      "No debe prometer descuentos, condiciones o plazos no autorizados.",
      "No debe cerrar acuerdos fuera de las reglas definidas por la empresa.",
      "No debe asumir presupuesto o intención de compra sin evidencia suficiente.",
      "No debe dejar una oportunidad clasificada como ganada sin confirmación humana cuando el proceso lo requiera.",
    ],
    indicators: [
      "Tiempo de primera respuesta.",
      "Porcentaje de leads contactados.",
      "Reuniones agendadas.",
      "Oportunidades reactivadas.",
      "Seguimientos completados en tiempo.",
    ],
    informationSources: [
      "Leads entrantes desde formularios o campañas.",
      "Mensajes de WhatsApp y canales comerciales autorizados.",
      "Historial del CRM o registro comercial.",
      "Criterios de calificación definidos por la empresa.",
    ],
    initials: "VA",
    metadataDescription:
      "Valentina organiza leads, califica oportunidades y entrega al vendedor humano un contexto comercial mucho más claro.",
    mission:
      "Su misión es evitar que el interés comercial se pierda por desorden, demora o falta de seguimiento, y convertir cada contacto en un próximo paso concreto.",
    name: "Valentina",
    postActionDeliverables: [
      "Lead clasificado con estado y prioridad.",
      "Registro de interacción y próximos pasos.",
      "Reunión agendada o seguimiento programado.",
      "Contexto completo para el vendedor humano.",
    ],
    portrait: {
      alt: "Retrato editorial de Valentina, especialista en desarrollo comercial de AgenteFactory.",
      objectPosition: "52% 18%",
      src: "/images/agents-v2/valentina-web-v2.jpg",
    },
    priority: "primary",
    problem:
      "Resuelve fugas comerciales causadas por respuestas tardías, seguimiento irregular, agendas desordenadas y oportunidades que se enfrían antes de avanzar.",
    result: "Vender más",
    role: "Especialista en Desarrollo Comercial",
    scenario: [
      {
        detail:
          "Entra un lead desde una campaña con nombre, empresa, necesidad general y canal de origen.",
        title: "1. Captura el lead",
      },
      {
        detail:
          "Valentina revisa si hay suficiente información para identificar intención, urgencia, encaje y prioridad comercial.",
        title: "2. Lo califica",
      },
      {
        detail:
          "Envía el primer contacto, responde dudas básicas, recoge contexto adicional y propone agenda cuando detecta una oportunidad real.",
        title: "3. Activa la conversación",
      },
      {
        detail:
          "Si el prospecto no responde, aplica la cadencia definida por la empresa en lugar de dejar la oportunidad dormida.",
        title: "4. Da seguimiento",
      },
      {
        detail:
          "Cuando el lead confirma interés, registra el contexto en el CRM y entrega al vendedor una oportunidad preparada para continuar.",
        title: "5. Transfiere con contexto",
      },
    ],
    signals: [
      "Los leads entran, pero nadie sabe cuál merece atención primero.",
      "Las reuniones se agendan de forma irregular o dependen de memoria humana.",
      "Hay propuestas enviadas sin seguimiento consistente.",
      "Se pierden oportunidades por tardanza o por falta de contexto al transferirlas.",
    ],
    slug: "valentina",
    tagline:
      "Califica, agenda y hace seguimiento sin comenzar cada mensaje con 'solo paso por aquí'.",
    useCases: [
      "Calificación de leads entrantes.",
      "Agendamiento comercial.",
      "Cadencias de seguimiento.",
      "Reactivación de oportunidades dormidas.",
      "Seguimiento de propuestas pendientes.",
    ],
  },
  {
    accent: "linear-gradient(135deg, #5cc8ff 0%, #00c7e6 100%)",
    collaboratesWith: [
      {
        exchange:
          "Transfiere consultas con intención de compra y entrega contexto previo para evitar repetir preguntas.",
        reason:
          "Cuando una conversación de servicio o información termina convirtiéndose en oportunidad comercial.",
        slug: "valentina",
      },
      {
        exchange:
          "Consulta políticas, manuales o documentos autorizados para responder con respaldo.",
        reason:
          "Cuando una respuesta exige precisión documental y no debe improvisarse.",
        slug: "sofia",
      },
      {
        exchange:
          "Crea o actualiza incidencias, casos o solicitudes que exigen seguimiento operativo.",
        reason:
          "Cuando la atención correcta depende de que alguien ejecute una tarea posterior.",
        slug: "olivia",
      },
    ],
    decisionsAndActions: [
      "Identificar al cliente, su intención y el contexto de la conversación.",
      "Responder según políticas y conocimiento aprobado.",
      "Clasificar solicitudes, dudas, incidencias o señales de urgencia.",
      "Crear o actualizar casos cuando hace falta seguimiento posterior.",
    ],
    diagnosticDefinition:
      "El Diagnóstico Estratégico de IA determina qué canales atenderá, qué políticas puede usar, cómo se clasifican las incidencias, cuándo debe escalar a una persona y qué información debe quedar registrada para no romper la continuidad del servicio.",
    expectedResults: [
      "Respuestas más rápidas y consistentes.",
      "Menos consultas repetidas atendidas manualmente.",
      "Escalamientos mejor clasificados.",
      "Clientes que no necesitan repetir la misma información una y otra vez.",
    ],
    headline:
      "Atiende consultas con contexto y continuidad para que el cliente sienta seguimiento, no rebote.",
    howItWorks: [
      "Recibe consultas por los canales definidos por la empresa y reconoce si ya existe historial previo del cliente.",
      "Ubica intención, urgencia y tipo de solicitud antes de responder o escalar.",
      "Responde con base en información aprobada y mantiene continuidad entre mensajes.",
      "Abre, actualiza o deriva casos cuando la solución depende de otra persona o de otra área.",
    ],
    humanEscalation:
      "Escala al equipo humano cuando detecta frustración alta, riesgo reputacional, una excepción no documentada o una situación que exige criterio humano inmediato.",
    humanLimits: [
      "No debe inventar políticas, compensaciones o respuestas no documentadas.",
      "No debe cerrar una incidencia delicada sin confirmar que la acción ocurrió realmente.",
      "No debe ignorar señales de urgencia o conflicto con el cliente.",
      "No debe acceder ni revelar información fuera de los permisos definidos.",
    ],
    indicators: [
      "Tiempo de respuesta.",
      "Resolución en primer contacto.",
      "Solicitudes correctamente escaladas.",
      "Consultas repetitivas absorbidas por el sistema.",
      "Satisfacción posterior cuando exista medición.",
    ],
    informationSources: [
      "Conversaciones por WhatsApp, web u otros canales autorizados.",
      "Historial del cliente o del caso.",
      "Políticas y respuestas aprobadas.",
      "Base documental o de conocimiento confiable.",
    ],
    initials: "CA",
    metadataDescription:
      "Carlos atiende consultas, conserva contexto y escala al área correcta sin obligar al cliente a empezar de nuevo.",
    mission:
      "Su misión es sostener una atención clara, ordenada y contextualizada para que cada consulta avance hacia una respuesta o una derivación útil.",
    name: "Carlos",
    postActionDeliverables: [
      "Respuesta enviada con contexto y tono consistente.",
      "Solicitud clasificada y, si hace falta, caso creado o actualizado.",
      "Historial de conversación listo para quien continúe el proceso.",
      "Confirmación de seguimiento cuando la consulta no queda cerrada en el primer contacto.",
    ],
    portrait: {
      alt: "Retrato editorial de Carlos, especialista en atención al cliente de AgenteFactory.",
      objectPosition: "50% 16%",
      src: "/images/agents-v2/carlos-web-v2.jpg",
    },
    priority: "primary",
    problem:
      "Resuelve tiempos de respuesta lentos, atención inconsistente, pérdida de contexto y desgaste operativo por consultas repetitivas.",
    result: "Atender mejor",
    role: "Especialista en Atención al Cliente",
    scenario: [
      {
        detail:
          "Un cliente escribe por WhatsApp con una duda sobre una entrega y un cambio de dirección previo.",
        title: "1. Recibe la consulta",
      },
      {
        detail:
          "Carlos identifica al cliente, recupera el contexto disponible y evita pedir de nuevo los mismos datos.",
        title: "2. Reconstruye el contexto",
      },
      {
        detail:
          "Responde con base en la política aprobada y confirma si la situación es informativa o si ya implica una incidencia.",
        title: "3. Responde y clasifica",
      },
      {
        detail:
          "Al detectar que la entrega necesita intervención operativa, abre o actualiza el caso y lo deriva con toda la información relevante.",
        title: "4. Escala correctamente",
      },
      {
        detail:
          "Hace seguimiento hasta confirmar que el cliente recibió atención sin repetir toda la historia.",
        title: "5. Cierra con continuidad",
      },
    ],
    signals: [
      "Los clientes deben repetir información cada vez que escriben.",
      "Las respuestas dependen demasiado de quién esté disponible en ese momento.",
      "Las incidencias se mezclan con preguntas simples y nadie las clasifica bien.",
      "El equipo pierde tiempo respondiendo una y otra vez las mismas consultas.",
    ],
    slug: "carlos",
    tagline:
      "Trabaja 24/7, nunca pierde la paciencia y sí recuerda el contexto.",
    useCases: [
      "Atención inicial por WhatsApp o web.",
      "Clasificación de solicitudes e incidencias.",
      "Seguimiento de casos abiertos.",
      "Escalamiento ordenado a ventas, operaciones o conocimiento.",
      "Continuidad conversacional entre mensajes.",
    ],
  },
  {
    accent: "linear-gradient(135deg, #86b65d 0%, #52d8aa 100%)",
    collaboratesWith: [
      {
        exchange:
          "Recibe oportunidades confirmadas, compromisos asumidos y fechas prometidas al cliente.",
        reason:
          "Cuando el trabajo comercial ya generó una operación que ahora debe ejecutarse sin pérdidas de información.",
        slug: "valentina",
      },
      {
        exchange:
          "Consulta procedimientos, documentos y referencias necesarias para mover tareas con criterio.",
        reason:
          "Cuando una operación depende de instrucciones internas, formatos o evidencia documental.",
        slug: "sofia",
      },
      {
        exchange:
          "Entrega estados, bloqueos, fechas vencidas y tiempos entre handoffs.",
        reason:
          "Cuando la empresa necesita visibilidad real de qué parte del flujo se está trabando.",
        slug: "diego",
      },
    ],
    decisionsAndActions: [
      "Convertir solicitudes en tareas estructuradas.",
      "Asignar responsables según reglas definidas por la empresa.",
      "Solicitar y perseguir aprobaciones necesarias para no detener el flujo.",
      "Detectar bloqueos, vencimientos o excepciones y alertar antes del incumplimiento.",
    ],
    diagnosticDefinition:
      "El Diagnóstico Estratégico de IA define qué procesos deben coordinarse, qué dependencias existen, quién puede aprobar cada paso, qué excepciones requieren intervención humana y qué estados operativos conviene volver visibles.",
    expectedResults: [
      "Menos tareas olvidadas entre equipos.",
      "Aprobaciones más visibles y menos cuellos de botella silenciosos.",
      "Mayor cumplimiento de fechas y compromisos.",
      "Más claridad sobre el estado real de cada operación.",
    ],
    headline:
      "Convierte solicitudes en un flujo operativo visible, con responsables, dependencias y alertas antes de que aparezca el retraso.",
    howItWorks: [
      "Recibe solicitudes desde ventas, atención, formularios o áreas internas.",
      "Las convierte en tareas con responsables, fechas, dependencias y estado.",
      "Persigue aprobaciones y detecta bloqueos antes de que el compromiso ya se haya roto.",
      "Consolida el estado del proceso y escala cuando una decisión necesita intervención humana.",
    ],
    humanEscalation:
      "Escala al equipo humano cuando una tarea requiere una decisión de criterio, una excepción operativa, una reasignación sensible o una aprobación que no puede inferirse automáticamente.",
    humanLimits: [
      "No debe aprobar por cuenta propia decisiones que exigen autorización formal.",
      "No debe reasignar responsables estratégicos sin reglas definidas.",
      "No debe cerrar tareas críticas sin evidencia o confirmación del área responsable.",
      "No debe ocultar bloqueos para mostrar una operación aparentemente saludable.",
    ],
    indicators: [
      "Tareas vencidas.",
      "Tiempo entre handoffs.",
      "Aprobaciones pendientes.",
      "Bloqueos detectados a tiempo.",
      "Cumplimiento de compromisos operativos.",
    ],
    informationSources: [
      "Solicitudes internas o externas que generan trabajo.",
      "Estados de tareas y responsables definidos.",
      "Reglas de aprobación y dependencias entre áreas.",
      "Fechas, compromisos y alertas operativas.",
    ],
    initials: "OL",
    metadataDescription:
      "Olivia coordina tareas, aprobaciones y handoffs para que la operación avance con menos fricción y más visibilidad.",
    mission:
      "Su misión es que la operación no dependa de perseguir personas manualmente para saber qué falta, quién debe actuar y qué está bloqueando el avance.",
    name: "Olivia",
    postActionDeliverables: [
      "Tareas creadas o actualizadas con responsables claros.",
      "Estado consolidado del proceso.",
      "Alertas por bloqueos, retrasos o aprobaciones pendientes.",
      "Historial de handoffs y compromisos visibles para el equipo humano.",
    ],
    portrait: {
      alt: "Retrato editorial de Olivia, coordinadora de operaciones de AgenteFactory.",
      objectPosition: "50% 14%",
      src: "/images/agents-v2/olivia-web-v2.jpg",
    },
    priority: "primary",
    problem:
      "Resuelve desorden operativo, handoffs difusos, tareas que dependen de seguimiento manual y aprobaciones que detienen la ejecución.",
    result: "Operar mejor",
    role: "Coordinadora de Operaciones",
    scenario: [
      {
        detail:
          "Un proceso involucra ventas, legal y operaciones para activar un nuevo cliente con fecha comprometida.",
        title: "1. Recibe la solicitud",
      },
      {
        detail:
          "Olivia separa el flujo en tareas, responsables y dependencias para que cada área sepa qué debe hacer y cuándo.",
        title: "2. Ordena el proceso",
      },
      {
        detail:
          "Detecta que falta una aprobación de legal y la persigue antes de que el retraso impacte la fecha prometida.",
        title: "3. Gestiona aprobaciones",
      },
      {
        detail:
          "Cuando una tarea se bloquea, alerta al responsable y escala si la decisión ya requiere intervención humana.",
        title: "4. Señala bloqueos",
      },
      {
        detail:
          "Mantiene un estado consolidado para que la empresa vea si el proceso avanza o si ya necesita corregir el curso.",
        title: "5. Consolida el avance",
      },
    ],
    signals: [
      "Las tareas pasan entre personas sin contexto suficiente.",
      "Las aprobaciones se olvidan hasta que ya venció el compromiso.",
      "Nadie tiene una vista clara del estado real de una operación.",
      "El equipo descubre los bloqueos demasiado tarde.",
    ],
    slug: "olivia",
    tagline:
      "Es alérgica al copiar y pegar y sospecha de todo proceso que necesite tres Excel.",
    useCases: [
      "Coordinación de solicitudes internas.",
      "Seguimiento de aprobaciones.",
      "Control de fechas y compromisos.",
      "Alertas por bloqueos y excepciones.",
      "Consolidación de estado operativo.",
    ],
  },
  {
    accent: "linear-gradient(135deg, #d0c5ad 0%, #335b4c 100%)",
    collaboratesWith: [
      {
        exchange:
          "Entrega respuestas respaldadas por documentos, políticas o versiones autorizadas.",
        reason:
          "Cuando atención necesita responder con precisión sin improvisar ni depender de memoria humana.",
        slug: "carlos",
      },
      {
        exchange:
          "Aporta procedimientos, formatos o referencias necesarias para ejecutar tareas correctamente.",
        reason:
          "Cuando una operación depende de instrucciones internas o evidencia documental.",
        slug: "olivia",
      },
      {
        exchange:
          "Marca documentos desactualizados, lagunas de conocimiento y fuentes inconsistentes.",
        reason:
          "Cuando análisis y dirección necesitan saber si las decisiones se apoyan en información confiable.",
        slug: "diego",
      },
    ],
    decisionsAndActions: [
      "Buscar información con contexto, no solo por coincidencia de palabras.",
      "Identificar versiones válidas y fuentes autorizadas.",
      "Citar la fuente usada en la respuesta cuando corresponde.",
      "Señalar contradicciones, vacíos o documentación desactualizada.",
    ],
    diagnosticDefinition:
      "El Diagnóstico Estratégico de IA define qué repositorios usará, qué documentos son fuente autorizada, qué permisos debe respetar, cómo debe citar la evidencia y en qué casos tiene que escalar por falta de respaldo suficiente.",
    expectedResults: [
      "Menos tiempo perdido buscando información dispersa.",
      "Más respuestas con fuente y versión identificable.",
      "Mayor disciplina sobre qué documento sí puede respaldar una acción.",
      "Visibilidad de vacíos o contradicciones documentales antes de que se conviertan en errores.",
    ],
    headline:
      "Encuentra la información correcta, indica de dónde sale y evita responder cuando la evidencia no alcanza.",
    howItWorks: [
      "Recibe una pregunta o tarea que depende de documentos internos, manuales, expedientes o bases de conocimiento.",
      "Busca por contexto, versión, relación con el caso y autoridad de la fuente.",
      "Devuelve la información relevante con referencia al documento usado o marca que la evidencia es insuficiente.",
      "Escala cuando detecta contradicciones, permisos restringidos o ausencia de respaldo confiable.",
    ],
    humanEscalation:
      "Escala al equipo humano cuando no existe evidencia suficiente, cuando la información está desactualizada o cuando el documento requerido no puede consultarse por permisos o ambigüedad.",
    humanLimits: [
      "No debe responder con seguridad cuando la documentación es contradictoria o insuficiente.",
      "No debe usar una versión no autorizada como si fuera la vigente.",
      "No debe saltarse restricciones de acceso a documentos.",
      "No debe completar vacíos documentales con suposiciones.",
    ],
    indicators: [
      "Tiempo ahorrado buscando información.",
      "Respuestas entregadas con fuente.",
      "Consultas sin respuesta por falta de evidencia.",
      "Documentos desactualizados detectados.",
      "Reutilización del conocimiento interno.",
    ],
    informationSources: [
      "Manuales y procedimientos internos.",
      "Políticas y documentos normativos autorizados.",
      "Expedientes o repositorios con permisos definidos.",
      "Versiones vigentes y registros documentales relevantes.",
    ],
    initials: "SO",
    metadataDescription:
      "Sofía encuentra información útil, indica la fuente correcta y evita respuestas inseguras cuando falta evidencia suficiente.",
    mission:
      "Su misión es transformar documentos dispersos en respuestas útiles y confiables, sin confundir acceso rápido con conocimiento verdadero.",
    name: "Sofía",
    postActionDeliverables: [
      "Respuesta respaldada con fuente o versión citada.",
      "Referencia explícita al documento utilizado.",
      "Señal de contradicción o desactualización cuando existe.",
      "Vacíos de conocimiento identificados para revisión humana.",
    ],
    portrait: {
      alt: "Retrato editorial de Sofía, especialista en conocimiento y documentos de AgenteFactory.",
      objectPosition: "50% 16%",
      src: "/images/agents-v2/sofia-web-v2.jpg",
    },
    priority: "secondary",
    problem:
      "Resuelve pérdida de tiempo buscando información, respuestas basadas en memoria parcial y procesos frenados por documentos difíciles de consultar.",
    result: "Aprovechar mejor la información",
    role: "Especialista en Conocimiento y Documentos",
    scenario: [
      {
        detail:
          "Un miembro del equipo necesita confirmar qué versión de una política aplica a un caso específico.",
        title: "1. Recibe la consulta",
      },
      {
        detail:
          "Sofía busca no solo por palabras, sino por contexto, fecha, tipo de documento y autoridad de la fuente.",
        title: "2. Busca con criterio",
      },
      {
        detail:
          "Encuentra la versión correcta, extrae el punto relevante y devuelve la respuesta indicando de dónde proviene.",
        title: "3. Responde con evidencia",
      },
      {
        detail:
          "Si detecta otra versión contradictoria o una política desactualizada, lo señala en lugar de mezclar ambas.",
        title: "4. Detecta inconsistencias",
      },
      {
        detail:
          "Cuando no existe evidencia suficiente, escala en lugar de inventar una respuesta cómoda pero insegura.",
        title: "5. Escala por falta de respaldo",
      },
    ],
    signals: [
      "El equipo pierde demasiado tiempo buscando archivos y versiones.",
      "Las respuestas cambian según quién recuerde mejor un documento.",
      "Nadie sabe con claridad cuál es la fuente autorizada.",
      "La empresa descubre tarde que estaba usando información vieja o contradictoria.",
    ],
    slug: "sofia",
    tagline:
      "Leyó el manual. Incluso ese PDF de 186 páginas que nadie abrió.",
    useCases: [
      "Consulta de políticas y manuales.",
      "Búsqueda contextual en documentos internos.",
      "Verificación de versión y fuente autorizada.",
      "Soporte documental para atención u operación.",
      "Detección de vacíos de conocimiento.",
    ],
  },
  {
    accent: "linear-gradient(135deg, #37d7a1 0%, #18b5a4 100%)",
    collaboratesWith: [
      {
        exchange:
          "Recibe actividad comercial, estados de seguimiento y resultados por canal, campaña o vendedor.",
        reason:
          "Cuando la empresa necesita saber si la actividad comercial realmente se está moviendo hacia oportunidades reales.",
        slug: "valentina",
      },
      {
        exchange:
          "Toma tiempos de respuesta, tipos de consulta y patrones de escalamiento.",
        reason:
          "Cuando la atención genera suficiente volumen como para revelar tendencias, fricciones o desviaciones.",
        slug: "carlos",
      },
      {
        exchange:
          "Consolida bloqueos, tiempos entre handoffs, tareas vencidas y estados operativos.",
        reason:
          "Cuando la operación necesita una lectura más clara para decidir dónde intervenir primero.",
        slug: "olivia",
      },
    ],
    decisionsAndActions: [
      "Consolidar información de distintas fuentes del proceso.",
      "Definir y seguir indicadores relevantes para dirección.",
      "Detectar tendencias, anomalías y cambios entre periodos, canales o equipos.",
      "Emitir alertas y resúmenes ejecutivos sin inventar causalidades.",
    ],
    diagnosticDefinition:
      "El Diagnóstico Estratégico de IA define qué indicadores importan, de dónde salen los datos, qué calidad mínima se necesita, con qué frecuencia se reporta y qué decisiones humanas deben seguir dependiendo de interpretación y contexto.",
    expectedResults: [
      "Menos tiempo consolidando datos manualmente.",
      "Más visibilidad sobre variaciones relevantes.",
      "Alertas más útiles antes de que el problema crezca.",
      "Resúmenes ejecutivos que ayudan a priorizar mejor.",
    ],
    headline:
      "Convierte actividad dispersa en indicadores, alertas y resúmenes útiles para decidir con más claridad.",
    howItWorks: [
      "Recibe información proveniente de ventas, atención, operaciones u otras fuentes relevantes.",
      "Revisa consistencia, completa faltantes detectables y señala datos insuficientes o anómalos.",
      "Compara periodos, equipos o canales para identificar cambios relevantes.",
      "Entrega una lectura ejecutiva que muestra qué está pasando sin atribuir causas que todavía no están demostradas.",
    ],
    humanEscalation:
      "Escala al equipo humano cuando detecta datos inconsistentes, una anomalía que necesita validación operativa o una señal que podría interpretarse de distintas maneras sin contexto adicional.",
    humanLimits: [
      "No debe inventar causalidades a partir de correlaciones simples.",
      "No debe maquillar datos incompletos para producir un reporte aparentemente limpio.",
      "No debe sustituir el juicio directivo cuando una decisión requiere contexto estratégico.",
      "No debe omitir alertas incómodas solo porque contradicen una expectativa previa.",
    ],
    indicators: [
      "Frecuencia de reportes entregados.",
      "Alertas relevantes detectadas.",
      "Calidad y consistencia de los datos usados.",
      "Variaciones detectadas a tiempo.",
      "Tiempo ahorrado consolidando información.",
    ],
    informationSources: [
      "Registros de ventas y seguimiento.",
      "Interacciones y tiempos de atención.",
      "Estados operativos y handoffs.",
      "Fuentes de datos estructuradas o reportes periódicos definidos por la empresa.",
    ],
    initials: "DI",
    metadataDescription:
      "Diego consolida información, detecta variaciones útiles y entrega lectura ejecutiva sin inventar explicaciones cómodas.",
    mission:
      "Su misión es convertir actividad dispersa en una lectura más confiable para que la empresa decida con evidencia suficiente y no solo con intuición.",
    name: "Diego",
    postActionDeliverables: [
      "Indicadores consolidados por periodo, equipo o canal.",
      "Alertas sobre anomalías o desviaciones relevantes.",
      "Resumen ejecutivo entendible para responsables no técnicos.",
      "Señales de datos incompletos o inconsistentes que deben corregirse.",
    ],
    portrait: {
      alt: "Retrato editorial de Diego, especialista en datos y rendimiento de AgenteFactory.",
      objectPosition: "50% 14%",
      src: "/images/agents-v2/diego-web-v2.jpg",
    },
    priority: "secondary",
    problem:
      "Resuelve falta de visibilidad, decisiones apoyadas en intuición y dificultad para detectar qué procesos mejoran y cuáles siguen frenados.",
    result: "Decidir mejor",
    role: "Analista de Datos y Rendimiento",
    scenario: [
      {
        detail:
          "Diego recibe la información semanal de ventas, atención y operación para consolidarla en una lectura única.",
        title: "1. Reúne los datos",
      },
      {
        detail:
          "Detecta que un canal comercial parece caer, pero primero valida si la variación responde a un cambio real o a datos incompletos.",
        title: "2. Verifica la calidad",
      },
      {
        detail:
          "Compara periodos y encuentra una desviación sostenida en reuniones agendadas frente al promedio reciente.",
        title: "3. Detecta la anomalía",
      },
      {
        detail:
          "No inventa una causa; entrega la señal, el periodo afectado y qué variables conviene investigar primero.",
        title: "4. Resume sin exagerar",
      },
      {
        detail:
          "La dirección recibe una explicación clara para actuar o pedir revisión adicional al área responsable.",
        title: "5. Entrega lectura útil",
      },
    ],
    signals: [
      "La empresa tiene actividad, pero poca visibilidad sobre qué está funcionando.",
      "Los reportes llegan tarde o requieren demasiada consolidación manual.",
      "Se detectan problemas cuando ya se hicieron grandes.",
      "La dirección recibe datos, pero no una lectura clara para priorizar decisiones.",
    ],
    slug: "diego",
    tagline: "No acepta 'creo que mejoramos' como indicador de gestión.",
    useCases: [
      "Seguimiento de indicadores comerciales.",
      "Lectura de tiempos de atención y resolución.",
      "Detección de cuellos de botella operativos.",
      "Alertas por desviaciones relevantes.",
      "Resúmenes ejecutivos periódicos.",
    ],
  },
  {
    accent: "linear-gradient(135deg, #7CE6A2 0%, #22D3EE 100%)",
    cardDescription:
      "Optimiza tu sitio para que más clientes te encuentren en Google y convierte el tráfico orgánico en nuevas oportunidades de negocio.",
    collaboratesWith: [
      {
        exchange:
          "Comparte páginas con intención comercial, búsquedas prioritarias y oportunidades para captar demanda más calificada.",
        reason:
          "Cuando el crecimiento orgánico debe alimentar mejor la captación comercial y no depender solo de campañas pagas.",
        slug: "valentina",
      },
      {
        exchange:
          "Consulta estructura de contenidos, documentación y criterios de precisión para reforzar páginas con información confiable.",
        reason:
          "Cuando una estrategia SEO necesita profundidad de contenido, claridad temática y respaldo documental.",
        slug: "sofia",
      },
      {
        exchange:
          "Recibe señales de tráfico, posiciones, páginas más visibles y cambios relevantes para traducirlos en lectura ejecutiva.",
        reason:
          "Cuando la empresa necesita entender si la visibilidad orgánica realmente está generando oportunidades y dónde conviene insistir.",
        slug: "diego",
      },
    ],
    decisionsAndActions: [
      "Investigar palabras clave relevantes para el negocio y distinguir intención de búsqueda real.",
      "Detectar páginas que pueden mejorar su posicionamiento y nuevas landings que conviene crear.",
      "Optimizar títulos, metadescripciones, headings, URLs y enlazado interno con criterio editorial y técnico.",
      "Identificar brechas frente a competidores, problemas de indexación y prioridades con mayor impacto potencial.",
    ],
    diagnosticDefinition:
      "El Diagnóstico Estratégico de IA define qué objetivos de negocio debe apoyar el canal orgánico, qué servicios o categorías merecen prioridad, qué páginas conviene optimizar primero, qué integraciones futuras aportarían contexto y cómo se conectará Andrés con comercial, contenido y análisis dentro del sistema.",
    expectedResults: [
      "Más visibilidad orgánica en búsquedas relevantes para el negocio.",
      "Más tráfico cualificado hacia páginas con intención real.",
      "Un backlog SEO priorizado según impacto potencial y viabilidad.",
      "Menor dependencia de publicidad para generar nuevas oportunidades.",
    ],
    futureIntegrations: [
      "Google Search Console",
      "Google Analytics",
      "Google Business Profile",
      "Semrush",
      "Ahrefs",
    ],
    headline: "Haz que te encuentren antes que a tu competencia.",
    howItWorks: [
      "Analiza el negocio, el sitio, a los competidores y la forma en que buscan los clientes.",
      "Encuentra keywords, páginas y búsquedas donde existe potencial real de posicionamiento.",
      "Optimiza contenido, estructura, enlazado y elementos SEO del sitio sin improvisar prioridades.",
      "Mide posiciones, tráfico orgánico, indexación y evolución de las páginas trabajadas.",
      "Prioriza las siguientes acciones según impacto potencial, esfuerzo y oportunidad.",
    ],
    humanEscalation:
      "Escala al equipo humano cuando una decisión afecta posicionamiento sensible, exige cambios de negocio o contenido especializado, o requiere validación editorial, técnica o comercial antes de publicar.",
    humanLimits: [
      "No debe prometer posiciones específicas ni resultados inmediatos.",
      "No debe publicar cambios estratégicos sin criterios editoriales y comerciales definidos.",
      "No debe confundir volumen de búsqueda con oportunidad real de negocio.",
      "No debe presentar integraciones o datos externos como activos si todavía no están implementados.",
    ],
    indicators: [
      "Crecimiento de visibilidad orgánica.",
      "Keywords priorizadas que ganan posiciones.",
      "Tráfico orgánico hacia páginas estratégicas.",
      "Cobertura e indexación de páginas clave.",
      "Oportunidades SEO ejecutadas según prioridad.",
    ],
    informationSources: [
      "Estructura actual del sitio web.",
      "Páginas, categorías y landings existentes.",
      "Consultas de búsqueda relevantes para el negocio.",
      "Competidores visibles en buscadores y señales futuras de herramientas conectadas.",
    ],
    initials: "AN",
    metadataDescription:
      "Andrés es el agente de SEO de AgenteFactory. Analiza oportunidades, optimiza tu sitio y trabaja para aumentar tu visibilidad y tráfico orgánico.",
    metadataTitle: "Andrés — Agente SEO con IA | AgenteFactory",
    mission:
      "Andrés analiza cómo buscan tus clientes, detecta oportunidades de posicionamiento y optimiza tu sitio para convertir Google en un canal constante de adquisición.",
    name: "Andrés",
    personalityLine: "Tiene algo personal contra la página 2 de Google.",
    portrait: {
      alt: "Andrés, especialista en SEO y posicionamiento de AgenteFactory.",
      objectPosition: "50% 18%",
      src: "/images/agents-v2/andres-web-v2.png",
    },
    postActionDeliverables: [
      "Mapa priorizado de keywords y búsquedas relevantes.",
      "Recomendaciones de optimización para páginas existentes.",
      "Briefs SEO para nuevas landings o contenidos.",
      "Lista de acciones técnicas y editoriales ordenadas por impacto potencial.",
    ],
    priority: "secondary",
    problem:
      "Resuelve la baja visibilidad orgánica, la dependencia excesiva de publicidad y la falta de una estrategia clara para captar búsquedas valiosas antes que la competencia.",
    result: "Más visibilidad",
    role: "SEO & Posicionamiento",
    scenario: [
      {
        detail:
          "Revisa el sitio actual, detecta qué páginas existen, qué servicios importa posicionar y cómo se está buscando hoy esa solución.",
        title: "1. Lee el terreno",
      },
      {
        detail:
          "Cruza intención de búsqueda, competencia y estructura del sitio para descubrir dónde hay huecos reales de posicionamiento.",
        title: "2. Encuentra la brecha",
      },
      {
        detail:
          "Propone mejoras concretas en páginas existentes y define nuevas landings cuando el sitio todavía no responde a búsquedas importantes.",
        title: "3. Optimiza con criterio",
      },
      {
        detail:
          "Monitorea posiciones, indexación y tráfico para evitar trabajar a ciegas o mover piezas sin lectura posterior.",
        title: "4. Mide evolución",
      },
      {
        detail:
          "Entrega una siguiente lista de acciones priorizadas para seguir construyendo un canal orgánico más sólido y menos dependiente del pago por clic.",
        title: "5. Prioriza el siguiente paso",
      },
    ],
    signals: [
      "El sitio existe, pero casi no aparece en búsquedas relevantes para el negocio.",
      "La captación depende demasiado de publicidad o referidos puntuales.",
      "Hay contenido o servicios valiosos que Google no está entendiendo bien.",
      "La competencia aparece en búsquedas clave y la empresa todavía no entra en la conversación.",
    ],
    slug: "andres",
    tagline:
      "Optimiza tu sitio para que más clientes te encuentren en Google y convierte el tráfico orgánico en nuevas oportunidades de negocio.",
    useCases: [
      "Investigación de palabras clave para servicios prioritarios.",
      "Optimización SEO de páginas existentes.",
      "Definición de nuevas landings con intención de búsqueda clara.",
      "Análisis SEO de competidores.",
      "Seguimiento de posiciones, indexación y tráfico orgánico.",
    ],
    valueMessage: {
      body: "Andrés trabaja para construir un canal de adquisición orgánico que siga generando oportunidades incluso cuando no estás pagando por cada clic.",
      title: "Tu sitio no debería depender únicamente de publicidad.",
    },
  },
];

const agentOrder = [
  "carlos",
  "valentina",
  "olivia",
  "sofia",
  "diego",
  "andres",
] as const;

agents.sort(
  (left, right) =>
    agentOrder.indexOf(left.slug as (typeof agentOrder)[number]) -
    agentOrder.indexOf(right.slug as (typeof agentOrder)[number]),
);

export const agentSummaries: AgentSummary[] = agents.map(
  ({
    accent,
    cardDescription,
    initials,
    name,
    portrait,
    priority,
    result,
    role,
    slug,
    tagline,
  }) => ({
    accent,
    cardDescription,
    initials,
    name,
    portrait,
    priority,
    result,
    role,
    slug,
    tagline,
  }),
);

export function getAgentBySlug(slug: string) {
  return agents.find((agent) => agent.slug === slug);
}
