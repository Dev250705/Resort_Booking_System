import React from 'react';
import { MapPin, Calendar, ChevronRight, Download } from 'lucide-react';
import './BookingCard.css';

const BookingCard = ({ booking, isFeatured = false }) => {
  if (!booking) return null;

  const resortName = booking.resort?.name || booking.resortName || 'Resort Stay';
  const locationObj = booking.resort?.location;
  const locationString = locationObj
    ? `${locationObj.city || ''}, ${locationObj.state || ''}`.replace(/^, | , /g, '')
    : (booking.location || 'Unknown Location');

  const checkIn = new Date(booking.checkInDate || booking.dates?.split(' - ')[0]).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const checkOut = new Date(booking.checkOutDate || booking.dates?.split(' - ')[1]).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const imageUrl = booking.resort?.images?.[0]
    ? (booking.resort.images[0].startsWith('http') ? booking.resort.images[0] : `http://localhost:5000${booking.resort.images[0]}`)
    : (booking.image || "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=600");

  const handleDownloadInvoice = () => {
    let customerName = 'Valued Guest';
    try {
      const userObj = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (userObj && userObj.name) customerName = userObj.name;
    } catch (e) { }

    const amount = booking.totalAmount || booking.price || 0;
    const bookingId = booking._id ? ('HRES' + booking._id.slice(-8).toUpperCase()) : ('NH' + Math.floor(Math.random() * 100000000));
    const invoiceNo = 'M06HL' + Math.floor(Math.random() * 1000000000);
    const invoiceDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const formatWithDay = (dStr) => {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    }
    const checkInTime = formatWithDay(booking.checkInDate || booking.dates?.split(' - ')[0]);
    const checkOutTime = formatWithDay(booking.checkOutDate || booking.dates?.split(' - ')[1]);
    const displayGuestName = booking.guestName || customerName;

    let addonsTotal = 0;
    let addonsHtml = '';
    if (booking.addons && booking.addons.length > 0) {
      booking.addons.forEach(addon => {
        const itemTotal = addon.price * (addon.quantity || 1);
        addonsTotal += itemTotal;
        addonsHtml += `
            <div class="payment-row">
              <span>${addon.title} (x${addon.quantity || 1})</span>
              <span>₹${itemTotal.toLocaleString('en-IN')}.00</span>
            </div>`;
      });
    }

    const preTaxAmount = amount / 1.18;
    const taxes = amount - preTaxAmount;
    const baseAmount = preTaxAmount - addonsTotal;

    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
      <html>
      <head>
        <style>
          @media print {
            @page { margin: 0; size: A4; }
            body { 
              margin: 1.5cm !important; 
              padding: 0 !important; 
              overflow: hidden !important; 
            }
            .invoice-container { 
              page-break-inside: avoid;
              page-break-after: avoid; 
              page-break-before: avoid; 
            }
          }
          body { font-family: Arial, sans-serif; padding: 30px; font-size: 11px; color: #000; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
          .header-left { width: 33%; }
          .header-left h1 { font-size: 20px; margin: 0; font-weight: bold; letter-spacing: 0.5px; }
          .header-center { width: 33%; text-align: center; }
          
          .center-logo { display: inline-flex; align-items: center; justify-content: center; flex-direction: column; }
          .logo-h { font-family: 'Times New Roman', serif; font-size: 36px; margin: 0; line-height: 1; }
          .logo-text { font-size: 9px; letter-spacing: 2px; margin-top: 4px; font-weight: bold; }
          
          .header-right { width: 33%; display: flex; flex-direction: column; align-items: flex-end; text-align: right; font-size: 10px; line-height: 1.4; }
          .header-right img { width: 100px; height: 100px; }
          
          .grid-wrapper { display: flex; justify-content: space-between; }
          .grid-left { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 15px 10px; padding-right: 20px;}
          .grid-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; width: 240px; text-align: right; }
          .grid-right img { width: 100px; height: 100px; }
          .address-block { font-size: 9px; line-height: 1.5; color: #333; }

          .info-block { display: flex; flex-direction: column; margin-bottom: 5px; }
          .info-block .label { color: #555; font-size: 10px; margin-bottom: 2px; }
          .info-block .value { font-weight: bold; font-size: 11px; }
          
          .hr-dashed { border: none; border-top: 1px dashed #000; margin: 20px 0; }
          
          .grid-3-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
          .grid-4-col-hotel { display: grid; grid-template-columns: 1.5fr 1fr 1.5fr 1.5fr; gap: 10px; }
          
          .payment-header { display: flex; align-items: center; text-align: center; margin: 25px 0 15px 0; font-weight: bold; font-size: 11px; letter-spacing: 1px; }
          .payment-header::before, .payment-header::after { content: ''; flex: 1; border-bottom: 1px dashed #000; }
          .payment-header::before { margin-right: 15px; }
          .payment-header::after { margin-left: 15px; }

          .payment-table { width: 100%; border: 1px solid #000; border-radius: 6px; overflow: hidden; border-spacing: 0; }
          .payment-row { display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px dashed #eee; }
          .payment-row:last-child { border-bottom: none; }
          .payment-row-sm { padding: 0 15px 8px 15px; font-size: 9px; color: #555; }
          .payment-row.bold { font-weight: bold; border-bottom: 1px dashed #eee; }
          .text-red { color: #d32f2f; }
          .border-top { border-top: 1px solid #000; }
          .grand-total { font-weight: bold; font-size: 12px; padding: 12px 15px; display: flex; justify-content: space-between; background-color: #fafafa; }
          
          .footer-note { font-weight: bold; margin-top: 20px; font-size: 11px; line-height: 1.5; }
          
          .terms-header { display: flex; align-items: center; text-align: center; margin: 30px 0 15px 0; font-weight: bold; font-size: 10px; letter-spacing: 1px; }
          .terms-header::before, .terms-header::after { content: ''; flex: 1; border-bottom: 1px dashed #000; }
          .terms-header::before { margin-right: 15px; }
          .terms-header::after { margin-left: 15px; }
          
          .terms-list { font-size: 10px; padding-left: 20px; color: #333; margin: 0; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header-row">
            <div class="header-left">
              <h1>TAX INVOICE</h1>
            </div>
            <div class="header-center">
              <div class="center-logo">
                <p class="logo-h">H</p>
                <p class="logo-text">RESORT</p>
              </div>
            </div>
            <div class="header-right">
              <div class="address-block" style="text-align: right;">
                <strong>H RESORT ONLINE BOOKING NETWORK</strong><br/>
                Corporate Headquarters: SG Highway,<br/>
                Nadiad, Gujarat, 387001<br/>
                hresort.stay@mail.com<br/>
                support.hresort@gmail.com
              </div>
            </div>
          </div>
          
          <div class="grid-wrapper">
            <div class="grid-left">
              <div class="info-block"><span class="label">Booking ID</span><span class="value">${bookingId.toUpperCase()}</span></div>
              <div class="info-block"><span class="label">PAN</span><span class="value">AADCM5146R</span></div>
              <div class="info-block"><span class="label">Invoice No.</span><span class="value">${invoiceNo}</span></div>
              <div class="info-block"><span class="label">HSN/SAC</span><span class="value">998552</span></div>
              <div class="info-block"><span class="label">Date</span><span class="value">${invoiceDate}</span></div>
              <div class="info-block"><span class="label">GSTIN</span><span class="value">24AADCM5146R1Z3</span></div>
              <div class="info-block"><span class="label">Place of Supply</span><span class="value">GUJARAT</span></div>
              <div class="info-block"><span class="label">CIN</span><span class="value">U63040HR2000PTC090846</span></div>
              <div class="info-block"><span class="label">Transactional Type/Category</span><span class="value">REG/B2C</span></div>
              <div class="info-block"><span class="label">Service Description</span><span class="value">Reservation service for accommodation</span></div>
              <div class="info-block"><span class="label">Transactional Details</span><span class="value">RG</span></div>
              <div class="info-block"><span class="label">Tax Payable under RCM</span><span class="value">No</span></div>
            </div>
            <div class="grid-right">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Invoice-${invoiceNo}" alt="QR Code" />
            </div>
          </div>
          
          <hr class="hr-dashed" />
          
          <div class="info-block"><span class="label">Customer Name</span><span class="value" style="font-size: 14px;">${displayGuestName}</span></div>
          
          <hr class="hr-dashed" />
          
          <div class="grid-4-col-hotel">
            <div class="info-block"><span class="label">Hotel Name</span><span class="value">${resortName}<br/><span style="font-weight:normal; font-size:9px;">${booking.roomTypeTitle || 'Standard Room'}</span></span></div>
            <div class="info-block"><span class="label">Hotel City</span><span class="value">${locationObj?.city || 'Mumbai'}</span></div>
            <div class="info-block"><span class="label">Check-in</span><span class="value">${checkInTime}, 2:00 PM</span></div>
            <div class="info-block"><span class="label">Check-Out</span><span class="value">${checkOutTime}, 11:00 AM</span></div>
          </div>
          
          <div class="payment-header">PAYMENT BREAKUP</div>
          
          <div class="payment-table">
            <div class="payment-row bold">
              <span>*Accomodation Charges</span>
              <span>₹${Math.round(baseAmount).toLocaleString('en-IN')}.00</span>
            </div>
            ${addonsHtml}
            <div class="payment-row bold">
              <span>Taxes & Fees (18%)</span>
              <span>₹${Math.round(taxes).toLocaleString('en-IN')}.00</span>
            </div>
            <div class="border-top grand-total">
              <span>Grand Total</span>
              <span>₹${amount.toLocaleString('en-IN')}.00</span>
            </div>
          </div>
          
          <div class="footer-note">
            Input tax credit of GST charged by the original service provider is available only against the invoice issued by the respective service provider. H Resort acts only as a facilitator for these services.<br/>
            This is not a valid travel document
          </div>
          
          <div class="terms-header">TERMS & CONDITIONS</div>
          <ol class="terms-list">
            <li>Any dispute with respect to the invoice is to be reported back to H Resort within 48 hours of receipt of invoice.</li>
            <li>QR code for B2B and SEZ category invoices can only be scanned using app downloaded from the link</li>
            <li>This is system generated invoice and does not require signatures.</li>
          </ol>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  return (
    <div className="booking-card">
      <div className="booking-image">
        <img src={imageUrl} alt={resortName} />
        <div className={`booking-status status-${booking.status?.toLowerCase()}`}>
          {booking.status}
        </div>
      </div>

      <div className="booking-details">
        <div className="booking-header">
          <h3>{resortName}</h3>
          {isFeatured && <span className="featured-badge">Next Stay</span>}
        </div>

        <div className="booking-info">
          <div className="info-item">
            <MapPin size={16} />
            <span>{locationString}</span>
          </div>
          <div className="info-item">
            <Calendar size={16} />
            <span>{checkIn} - {checkOut}</span>
          </div>
        </div>

        <div className="booking-actions" style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {(booking.status === 'Confirmed' || booking.status === 'Completed') && (
            <button className="btn-action secondary" onClick={handleDownloadInvoice}>
              <Download size={16} />
              Download Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
