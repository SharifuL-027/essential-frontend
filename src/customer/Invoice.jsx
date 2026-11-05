import React from 'react';
import html2pdf from 'html2pdf.js';
import { Download, FileText } from 'lucide-react';

const Invoice = ({ order }) => {

  const downloadPDF = () => {
    const element = document.getElementById(`invoice-${order._id}`);
    
    const opt = {
      margin:       0.5,
      filename:     `Invoice_${order._id.substring(order._id.length - 8).toUpperCase()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div>
      {/* 🔘 Download Button */}
      <button
        onClick={downloadPDF}
        className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-cyan-700 transition cursor-pointer"
      >
        <Download className="w-4 h-4" /> Download Invoice
      </button>

      {/* 📄 Hidden Invoice Template for PDF Generation */}
      <div className="hidden">
        <div id={`invoice-${order._id}`} className="p-8 bg-white font-sans text-gray-800">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-black text-cyan-600 tracking-wider">ESSENTIAL ZONE</h1>
              <p className="text-xs text-gray-500 mt-1">Dhaka, Bangladesh</p>
              <p className="text-xs text-gray-500">Support: support@essentialzone.com</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800 uppercase">INVOICE</h2>
              <p className="text-xs text-gray-500 mt-1">Invoice ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
              <p className="text-xs text-gray-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To:</p>
              <p className="text-sm font-bold text-gray-800 capitalize">{order.shippingAddress?.name || 'Customer'}</p>
              <p className="text-xs text-gray-600">{order.shippingAddress?.phone}</p>
              <p className="text-xs text-gray-600">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method:</p>
              <p className="text-sm font-bold text-cyan-600">{order.paymentMethod || 'Cash On Delivery'}</p>
              <p className="text-xs text-gray-500 mt-1">Status: <span className="font-bold text-green-600">{order.isPaid ? 'Paid' : 'Unpaid'}</span></p>
            </div>
          </div>

          {/* Product Table */}
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
              {order.orderItems?.map((item, index) => (
                <tr key={index}>
                  <td className="p-3 font-medium text-gray-800">{item.name}</td>
                  <td className="p-3 text-center font-bold">{item.quantity || item.qty || 1}</td>
                  <td className="p-3 text-right">৳ {(item.price || 0).toLocaleString()}</td>
                  <td className="p-3 text-right font-bold">৳ {((item.quantity || item.qty || 1) * (item.price || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Section */}
          <div className="flex justify-end border-t border-gray-200 pt-4">
            <div className="w-48 text-right space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal:</span>
                <span>৳ {order.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Shipping:</span>
                <span>৳ 0</span>
              </div>
              <div className="flex justify-between text-sm font-black text-cyan-600 border-t border-gray-200 pt-2">
                <span>Grand Total:</span>
                <span>৳ {order.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 text-center border-t border-gray-100 pt-4 text-[10px] text-gray-400">
            Thank you for shopping with Essential Zone!
          </div>

        </div>
      </div>
    </div>
  );
};

export default Invoice;