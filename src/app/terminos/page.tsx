import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Términos de Servicio — Press" };

export default function Terminos() {
  return (
    <LegalPage title="Términos de Servicio">
      <p>
        Al crear una cuenta y marcar &quot;Acepto&quot;, usted acepta estos términos. Esta aceptación electrónica tiene
        validez conforme al Decreto con Fuerza de Ley sobre Mensajes de Datos y Firmas Electrónicas de la República
        Bolivariana de Venezuela.
      </p>
      <h2>1. El servicio</h2>
      <p>
        Press es una herramienta de software para crear, guardar y enviar presupuestos. Press no participa en la relación
        entre usted y sus clientes.
      </p>
      <h2>2. Responsabilidad sobre los presupuestos</h2>
      <p>
        Usted es el único responsable de los precios, cantidades, impuestos y condiciones de sus presupuestos. Los precios
        de las plantillas son referenciales. Press no responde por errores de cálculo introducidos por el usuario ni por
        disputas con sus clientes.
      </p>
      <h2>3. Prueba gratuita y pagos</h2>
      <p>
        Las cuentas nuevas reciben 15 días de prueba con acceso completo. Luego, el acceso cuesta 10 USDT o 10 USDC por
        cada periodo de 30 días, pagados por Binance. El acceso se activa cuando el pago es verificado. Los pagos no son
        reembolsables una vez iniciado el periodo. Sin pago vigente, la cuenta queda en modo de solo lectura.
      </p>
      <h2>4. Licencia y propiedad intelectual</h2>
      <p>
        Se le otorga una licencia limitada, personal y no exclusiva para usar Press. El software, la marca y el diseño
        pertenecen a sus titulares. Sus datos y presupuestos son suyos.
      </p>
      <h2>5. Uso aceptable</h2>
      <p>
        No puede usar Press para actividades ilícitas, ni intentar acceder sin autorización a sistemas o datos, conforme a
        la Ley Especial contra los Delitos Informáticos.
      </p>
      <h2>6. Disponibilidad</h2>
      <p>
        Hacemos lo posible por mantener el servicio disponible, pero puede haber interrupciones por mantenimiento, fallas
        de terceros o de conectividad. En la medida permitida por la ley, Press no responde por daños indirectos o pérdida
        fortuita de datos.
      </p>
      <h2>7. Terminación</h2>
      <p>
        Puede dejar de usar Press cuando quiera. Podemos suspender cuentas que incumplan estos términos. Las cuentas sin
        actividad ni pago por más de 90 días podrán ser bloqueadas.
      </p>
      <h2>8. Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes de la República Bolivariana de Venezuela.</p>
      <h2>9. Contacto</h2>
      <p>Para dudas, escríbanos por WhatsApp desde el botón de ayuda dentro de la aplicación.</p>
    </LegalPage>
  );
}
