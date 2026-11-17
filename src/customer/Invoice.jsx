import React, { useState, useEffect } from 'react';
import { Download, FileText, X, Printer, CheckCircle } from 'lucide-react';

const Invoice = ({ order, autoOpen = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(autoOpen);

  useEffect(() => {
    setIsOpen(autoOpen);
  }, [autoOpen]);

  if (!order) return null;

  const orderIdShort = String(order._id || 'ORDER').slice(-8).toUpperCase();
  const items = order.orderItems || [];
  const subtotal = order.itemsPrice ?? items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || item.qty || 1)), 0);
  const shipping = order.shippingPrice ?? Math.max(0, (order.totalPrice || 0) - subtotal);
  const grandTotal = order.totalPrice ?? (subtotal + shipping);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // ⚡ Instant Print & Save as PDF (Zero Hang, Zero External CSS/Canvas Blocking)
  const triggerPrintOrPDF = () => {
    const itemsRows = items.map((item) => {
      const qty = item.quantity || item.qty || 1;
      const price = Number(item.price || 0);
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 10px; font-size: 13px; color: #1f2937; font-weight: 600;">
            ${item.name || 'Product'}
          </td>
          <td style="padding: 12px 10px; text-align: center; font-size: 13px; font-weight: bold; color: #374151;">
            ${qty}
          </td>
          <td style="padding: 12px 10px; text-align: right; font-size: 13px; color: #4b5563;">
            ৳ ${price.toLocaleString()}
          </td>
          <td style="padding: 12px 10px; text-align: right; font-size: 13px; font-weight: bold; color: #111827;">
            ৳ ${(qty * price).toLocaleString()}
          </td>
        </tr>
      `;
    }).join('');

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Invoice_${orderIdShort}</title>
          <style>
            * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; }
            body { margin: 0; padding: 30px; color: #1f2937; background: #ffffff; }
            .container { max-width: 780px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 24px; }
            .brand { font-size: 24px; font-weight: 900; color: #0891b2; margin: 0; letter-spacing: 0.5px; }
            .muted { font-size: 12px; color: #6b7280; margin: 4px 0 0; }
            .info-box { display: flex; justify-content: space-between; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #f3f4f6; padding: 12px 10px; font-size: 11px; text-transform: uppercase; color: #4b5563; text-align: left; border-bottom: 1px solid #d1d5db; }
            .totals { display: flex; justify-content: flex-end; }
            .totals-box { width: 240px; }
            .row { display: flex; justify-content: space-between; font-size: 13px; color: #4b5563; margin-bottom: 8px; }
            .grand { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #0891b2; border-top: 2px solid #e5e7eb; padding-top: 10px; margin-top: 8px; }
            .footer { margin-top: 45px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 15px; }
            @media print {
              body { padding: 10px; }
              @page { margin: 12mm; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <h1 class="brand">ESSENTIAL ZONE</h1>
                <p class="muted">Dhaka, Bangladesh</p>
                <p class="muted">Support: support@essentialzone.com</p>
              </div>
              <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 20px; color: #111827;">INVOICE</h2>
                <p class="muted">Invoice ID: <strong>#${orderIdShort}</strong></p>
                <p class="muted">Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            <div class="info-box">
              <div>
                <p style="margin: 0 0 6px; font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase;">Billed To:</p>
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #111827;">${order.shippingAddress?.name || 'Customer'}</p>
                <p class="muted">${order.shippingAddress?.phone || ''}</p>
                <p class="muted">${order.shippingAddress?.address || ''}${order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0 0 6px; font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase;">Payment Info:</p>
                <p style="margin: 0; font-size: 13px; font-weight: bold; color: #0891b2;">${order.paymentMethod || 'Cash On Delivery'}</p>
                <p class="muted">Status: <strong style="color: ${order.isPaid ? '#16a34a' : '#dc2626'};">${order.isPaid ? 'Paid' : 'Unpaid'}</strong></p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center; width: 70px;">Qty</th>
                  <th style="text-align: right; width: 110px;">Price</th>
                  <th style="text-align: right; width: 120px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-box">
                <div class="row">
                  <span>Subtotal:</span>
                  <span><strong>৳ ${subtotal.toLocaleString()}</strong></span>
                </div>
                <div class="row">
                  <span>Shipping:</span>
                  <span><strong>৳ ${shipping.toLocaleString()}</strong></span>
                </div>
                <div class="grand">
                  <span>Grand Total:</span>
                  <span>৳ ${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              Thank you for shopping with Essential Zone!
            </div>
          </div>
        </body>
      </html>
    `;

    // Hidden iframe দিয়ে প্রিন্ট/PDF ডায়ালগ ওপেন করলে পপ-আপ ব্লক হয় না এবং মূল পেজ কখনো হ্যাং হয় না
    const existingFrame = document.getElementById('print-invoice-frame');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-invoice-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(invoiceHTML);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
    }, 200);
  };

  return (
    <>
      {/* 🔘 বাটন */}
      {!autoOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-cyan-600 hover:text-white transition cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" /> Invoice
        </button>
      )}

      {/* 📄 Invoice Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Top Bar */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm sm:text-base">
                {autoOpen ? <CheckCircle className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5" />}
                <span>{autoOpen ? 'Order Confirmed! Your Invoice' : `Invoice #${orderIdShort}`}</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Preview */}
            <div className="max-h-[75vh] overflow-y-auto bg-white p-6 sm:p-8 font-sans text-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-200 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-cyan-600 tracking-wider">ESSENTIAL ZONE</h1>
                  <p className="text-xs text-gray-500 mt-1">Dhaka, Bangladesh</p>
                  <p className="text-xs text-gray-500">Support: support@essentialzone.com</p>
                </div>
                <div className="sm:text-right">
                  <h2 className="text-xl font-bold text-gray-800 uppercase">INVOICE</h2>
                  <p className="text-xs text-gray-500 mt-1">Invoice ID: #{orderIdShort}</p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To:</p>
                  <p className="text-sm font-bold text-gray-800 capitalize">{order.shippingAddress?.name || 'Customer'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{order.shippingAddress?.phone}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {order.shippingAddress?.address}, {order.shippingAddress?.city}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method:</p>
                  <p className="text-sm font-bold text-cyan-600">{order.paymentMethod || 'Cash On Delivery'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: <span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse mb-6">
                  <thead>
                    <tr className="bg-gray-100 text-xs font-bold text-gray-600 uppercase border-b border-gray-200">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="p-3 font-medium text-gray-800 flex items-center gap-2.5">
                          {item.image && (
                            <img src={item.image} alt="" className="w-9 h-9 object-contain rounded border border-gray-200 shrink-0" />
                          )}
                          <span>{item.name}</span>
                        </td>
                        <td className="p-3 text-center font-bold">{item.quantity || item.qty || 1}</td>
                        <td className="p-3 text-right">৳ {(item.price || 0).toLocaleString()}</td>
                        <td className="p-3 text-right font-bold">
                          ৳ {((item.quantity || item.qty || 1) * (item.price || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end border-t border-gray-200 pt-4">
                <div className="w-56 text-right space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">৳ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Shipping:</span>
                    <span className="font-semibold">৳ {shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-cyan-600 border-t border-gray-200 pt-2">
                    <span>Grand Total:</span>
                    <span>৳ {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center border-t border-gray-100 pt-4 text-[11px] text-gray-400">
                Thank you for shopping with Essential Zone!
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                {autoOpen ? 'Continue to Account' : 'Close'}
              </button>
              <button
                type="button"
                onClick={triggerPrintOrPDF}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-900 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
              <button
                type="button"
                onClick={triggerPrintOrPDF}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-cyan-700 transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Save as PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Invoice;