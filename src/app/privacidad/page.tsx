import { LegalPage } from "@/components/LegalPage";

export const metadata = { title: "Política de Privacidad — Press" };

export default function Privacidad() {
  return (
    <LegalPage title="Política de Privacidad">
      <p>
        Respetamos su privacidad conforme a los artículos 28 y 60 de la Constitución de la República Bolivariana de
        Venezuela.
      </p>
      <h2>1. Datos que guardamos</h2>
      <p>
        Su correo, nombre, teléfono, datos de su negocio (nombre, oficio, logo, RIF o cédula si los agrega), los
        presupuestos que crea, los datos de sus clientes que usted registre, y los comprobantes de pago que suba.
      </p>
      <h2>2. Para qué los usamos</h2>
      <p>
        Solo para prestarle el servicio: crear y enviar sus presupuestos, verificar sus pagos, darle soporte y avisarle
        sobre su cuenta.
      </p>
      <h2>3. No vendemos sus datos</h2>
      <p>Nunca vendemos ni alquilamos sus datos ni los de sus clientes a terceros.</p>
      <h2>4. Proveedores</h2>
      <p>
        Usamos proveedores para operar: Google Firebase (base de datos, inicio de sesión y archivos), Netlify (hosting),
        Telegram (avisos internos de pago al administrador) y Binance (pagos). Ellos tratan los datos solo para ese fin.
      </p>
      <h2>5. Sus derechos</h2>
      <p>
        Puede pedir acceso, corrección o eliminación de sus datos escribiéndonos por WhatsApp desde la aplicación.
      </p>
      <h2>6. Seguridad</h2>
      <p>
        Sus datos están protegidos con reglas de acceso: solo usted puede ver la información de su negocio. Los
        presupuestos que usted comparte por enlace pueden ser vistos por quien tenga ese enlace.
      </p>
    </LegalPage>
  );
}
