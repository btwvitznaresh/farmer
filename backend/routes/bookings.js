const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '..', 'data', 'bookings.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));

function readBookings() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeBookings(bookings) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
}

// POST /api/bookings — create
router.post('/', (req, res) => {
  try {
    const booking = { ...req.body, receivedAt: new Date().toISOString() };
    const bookings = readBookings();
    // Upsert: replace if ID already exists
    const idx = bookings.findIndex(b => b.id === booking.id);
    if (idx >= 0) bookings[idx] = booking;
    else bookings.unshift(booking);
    writeBookings(bookings);

    console.log(`\n📋 New Booking Received:`);
    console.log(`   ID:       ${booking.id}`);
    console.log(`   Service:  ${booking.serviceName}`);
    console.log(`   Farmer:   ${booking.farmerName}`);
    console.log(`   Location: ${booking.farmLocation}`);
    console.log(`   Date:     ${booking.scheduleDate} (${booking.timeSlot})`);
    console.log(`   Urgency:  ${booking.urgency}`);
    console.log(`   Assigned: ${booking.assignedMember}`);

    res.json({ success: true, id: booking.id });
  } catch (err) {
    console.error('Booking create error:', err);
    res.status(500).json({ success: false, error: 'Failed to save booking' });
  }
});

// GET /api/bookings — list all (admin)
router.get('/', (req, res) => {
  try {
    res.json({ success: true, bookings: readBookings() });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to read bookings' });
  }
});

// GET /api/bookings/:id — single booking
router.get('/:id', (req, res) => {
  const bookings = readBookings();
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, booking });
});

// PATCH /api/bookings/:id — update status
router.patch('/:id', (req, res) => {
  try {
    const bookings = readBookings();
    const idx = bookings.findIndex(b => b.id === req.params.id);
    if (idx < 0) return res.status(404).json({ success: false, error: 'Not found' });
    bookings[idx] = { ...bookings[idx], ...req.body, updatedAt: Date.now() };
    writeBookings(bookings);
    console.log(`📝 Booking ${req.params.id} updated: status=${bookings[idx].status}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

// DELETE /api/bookings/:id — cancel
router.delete('/:id', (req, res) => {
  try {
    const bookings = readBookings();
    const filtered = bookings.filter(b => b.id !== req.params.id);
    writeBookings(filtered);
    console.log(`🗑️  Booking ${req.params.id} cancelled`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete booking' });
  }
});

module.exports = router;
