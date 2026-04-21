import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './myBookings.css';

export default function MyBookings() {
  const FALLBACK_RESORT_IMAGE = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=600';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://${window.location.hostname}:5000/api/bookings/my-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;
    
    setCancellingId(bookingId);
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`http://${window.location.hostname}:5000/api/bookings/cancel/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to cancel booking');
      
      alert("Booking has been successfully cancelled.");
      fetchBookings(); // Refresh list
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadInvoice = (booking) => {
    let customerName = 'Valued Guest';
    try {
      const userObj = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      if (userObj && userObj.name) customerName = userObj.name;
    } catch (e) {}

    const resortName = booking.resort?.name || 'Resort Stay';
    const locationObj = booking.resort?.location;
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
            <div class="info-block"><span class="label">Hotel City</span><span class="value">${locationObj?.city || 'Goa'}</span></div>
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

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getBookingImageUrl = (booking) => {
    const rawImage =
      booking?.resort?.images?.[0]?.url ||
      booking?.resort?.images?.[0] ||
      booking?.image;

    if (!rawImage || typeof rawImage !== 'string') {
      return FALLBACK_RESORT_IMAGE;
    }

    if (rawImage.startsWith('/uploads')) {
      return `http://${window.location.hostname}:5000${rawImage}`;
    }

    return rawImage;
  };

  const now = new Date();
  
  const upcomingBookings = bookings.filter(b => 
    (b.status === "Confirmed" || b.status === "Pending_Payment") && 
    new Date(b.checkOutDate) >= now
  );

  const pastBookings = bookings.filter(b => 
    b.status === "Cancelled" || 
    b.status === "Expired" || 
    b.status === "Completed" || 
    new Date(b.checkOutDate) < now
  );

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const canCancelBooking = (booking) => {
    if (!(booking.status === "Confirmed" || booking.status === "Pending_Payment")) {
      return false;
    }

    // Past stays should never show cancel action even if status stayed "Confirmed".
    return new Date(booking.checkOutDate) >= new Date();
  };

  return (
    <div className="bookings-page-wrapper">
      <Navbar />
      <div className="my-bookings-ultra-container">
        <div className="bookings-hero">
          <div className="hero-content">
            <h1>My Journeys</h1>
            <p>Manage your upcoming escapes and past memories.</p>
          </div>
        </div>

        <div className="bookings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Escapes
            <span className="badge">{upcomingBookings.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past & Cancelled
            <span className="badge">{pastBookings.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="lux-loader-container">
            <div className="lux-spinner"></div>
          </div>
        ) : error ? (
          <div className="lux-error">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="lux-empty-state">
            <div className="empty-icon-ring">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h2>No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Journeys</h2>
            <p>Your itinerary is currently empty.</p>
            {activeTab === 'upcoming' && <Link to="/resorts" className="lux-btn-primary">Discover Resorts</Link>}
          </div>
        ) : (
          <div className="lux-booking-grid">
            {displayedBookings.map((booking) => (
              <div key={booking._id} className="lux-booking-card">
                <div className="lux-booking-image">
                  <img 
                    src={getBookingImageUrl(booking)} 
                    alt={booking.resort?.name || 'Resort'} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_RESORT_IMAGE;
                    }}
                  />
                  <div className={`lux-status-badge status-${booking.status}`}>
                    {booking.status.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="lux-booking-content">
                  <div className="lux-resort-title">
                    <h2>{booking.resort?.name || 'Grand Resort'}</h2>
                    <p>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {booking.resort?.location?.city || 'Location unavailable'}
                    </p>
                  </div>

                  <div className="lux-stay-dates">
                    <div className="date-block">
                      <span>CHECK-IN</span>
                      <strong>{formatDate(booking.checkInDate)}</strong>
                    </div>
                    <div className="date-divider"></div>
                    <div className="date-block text-right">
                      <span>CHECK-OUT</span>
                      <strong>{formatDate(booking.checkOutDate)}</strong>
                    </div>
                  </div>

                  <div className="lux-booking-footer">
                    <div className="lux-price-info">
                      <span className="lux-price-label">Total Amount</span>
                      <strong className="lux-price-value">₹{booking.totalAmount?.toLocaleString()}</strong>
                      <span className="lux-room-type">{booking.roomTypeTitle}</span>
                    </div>

                    <div className="lux-actions">
                      {canCancelBooking(booking) && (
                        <button 
                          className="lux-btn-cancel"
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                        >
                          {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                      {(booking.status === "Confirmed" || booking.status === "Completed") && (
                        <button 
                          className="lux-btn-outline"
                          onClick={() => handleDownloadInvoice(booking)}
                          style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                        >
                          Download Invoice
                        </button>
                      )}
                      <Link to={`/resort/${booking.resort?._id}`} className="lux-btn-outline">
                        View Resort
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
