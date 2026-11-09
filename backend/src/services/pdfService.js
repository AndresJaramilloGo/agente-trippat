import PDFDocument from 'pdfkit';

export function createOrderPdf(order) {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ margin: 48 });
    const chunks = [];
    document.on('data', (chunk) => chunks.push(chunk));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);

    document.fontSize(20).text('Comanda de pedido', { align: 'center' });
    document.moveDown();
    document.fontSize(11).text(`Número: ${order.id}`);
    document.text(`Fecha: ${new Date(order.createdAt).toLocaleString('es-EC')}`);
    document.text(`Cliente: ${order.customer.name}`);
    document.text(`Dirección: ${order.customer.address}`);
    document.text(`Teléfono: ${order.customer.phone}`);
    document.moveDown();
    document.fontSize(14).text('Detalle');
    document.moveDown(0.5);

    for (const item of order.items) {
      document.fontSize(11).text(
        `${item.quantity} × ${item.name} — $${item.unitPrice.toFixed(2)} ( $${item.lineTotal.toFixed(2)} )`,
      );
      if (item.comment) document.fontSize(9).text(`  Nota: ${item.comment}`);
    }

    document.moveDown();
    document.fontSize(14).text(`Total: $${order.total.toFixed(2)}`, { align: 'right' });
    document.end();
  });
}
