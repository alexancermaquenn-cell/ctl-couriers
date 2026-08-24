import { PrismaClient, ShipmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CONTENT: Record<string, unknown> = {
  brand: {
    name: 'Cargo Transportation Logistics',
    short: 'CTL',
    logo: '/img/logo.png',
    banner: '/img/banner.jpg',
    tagline: 'Global freight, delivered with precision.',
  },
  hero: {
    eyebrow: 'Available 24/7 · 365 days a year',
    title: 'Reliable Shipping Solutions Across the Globe',
    subtitle:
      'Cargo Transportation Logistics Limited meets your urgent shipping needs around the globe faster than anyone else — from critical parts to time-sensitive documents.',
    ctaPrimary: { label: 'Track a Shipment', href: '/tracking' },
    ctaSecondary: { label: 'Get a Quote', href: '/contact' },
  },
  stats: [
    { value: '190+', label: 'Countries served' },
    { value: '24/7', label: 'Live monitoring' },
    { value: '99.2%', label: 'On-time delivery' },
    { value: '15k+', label: 'Shipments / month' },
  ],
  about: {
    title: 'A logistics partner you can rely on',
    body:
      "Our personalized service offers hands-on monitoring, web-based tracking and guaranteed on-time delivery for your most impossible deadlines. Wherever your company operates, we make sure your documents, consignments and business mail are delivered safely and on time using our integrated air and road networks. Our international operations are focused on the key areas of world trade in North and South America, Europe, Asia and Australia.",
  },
  services: [
    {
      title: 'Cargo Transport Services',
      desc: 'Full-load and part-load freight moved across integrated air and road networks with guaranteed lower prices.',
      icon: 'Truck',
    },
    {
      title: 'Motor Vehicle Relocation',
      desc: 'Door-to-door vehicle shipping for individuals and businesses, fully insured and tracked end-to-end.',
      icon: 'Car',
    },
    {
      title: 'Freight Delivery Division',
      desc: 'Time-critical freight for assembly lines and supply chains, monitored around the clock.',
      icon: 'PackageCheck',
    },
    {
      title: 'Parcel Delivery',
      desc: 'Fast, reliable parcel delivery with real-time web tracking and on-time guarantees.',
      icon: 'Package',
    },
    {
      title: 'Letter & Document Delivery',
      desc: 'Secure delivery of business mail and critical documents anywhere in the world.',
      icon: 'FileText',
    },
    {
      title: 'Warehousing & SafeDeal',
      desc: 'Insured, secured and bonded warehousing with our SafeDeal escrow-backed handling.',
      icon: 'Warehouse',
    },
  ],
  features: [
    { title: 'Real-time tracking', desc: 'Web-based live tracking on every shipment.' },
    { title: 'Guaranteed on-time', desc: 'On-time delivery for your most impossible deadlines.' },
    { title: 'Insured & bonded', desc: 'Insured, secured and bonded facilities worldwide.' },
    { title: 'Global network', desc: 'Warehouses in Norway, Denmark & Italy + partner network.' },
  ],
  faq: [
    { q: 'How do I track my shipment?', a: 'Enter your tracking number on the Tracking page to see live status and checkpoints.' },
    { q: 'Which countries do you serve?', a: 'We operate across North & South America, Europe, Asia and Australia — 190+ countries.' },
    { q: 'Do you handle vehicle relocation?', a: 'Yes. Our Motor Vehicle Relocation service ships vehicles door-to-door, fully insured.' },
    { q: 'Are shipments insured?', a: 'All shipments use insured, secured and bonded facilities.' },
  ],
  contact: {
    email: 'support@ctl-logistics.com',
    phone: '+1 (800) 555-0192',
    address: 'Global Operations — Norway · Denmark · Italy',
    hours: '24 hours a day, 365 days a year',
  },
  footer: {
    about: 'Cargo Transportation Logistics utilizes insured, secured and bonded facilities. We provide warehousing, packing, crating, trucking and loading services out of our own warehouses.',
    copyright: `© ${new Date().getFullYear()} Cargo Transportation Logistics Limited. All Rights Reserved.`,
  },
};

const DEMO_SHIPMENTS = [
  {
    trackingNumber: 'CTL-4830-2291',
    status: ShipmentStatus.IN_TRANSIT,
    origin: 'Oslo, Norway',
    destination: 'Milan, Italy',
    senderName: 'Nordic Auto Parts AS',
    receiverName: 'Rossi Import SRL',
    weightKg: 1240,
    service: 'Cargo Transport',
    events: [
      { status: ShipmentStatus.PENDING, location: 'Oslo, Norway', note: 'Shipment registered', daysAgo: 5 },
      { status: ShipmentStatus.PICKED_UP, location: 'Oslo Hub, Norway', note: 'Picked up from sender', daysAgo: 4 },
      { status: ShipmentStatus.IN_TRANSIT, location: 'Copenhagen, Denmark', note: 'Departed transit hub', daysAgo: 2 },
      { status: ShipmentStatus.CUSTOMS, location: 'Milan Customs, Italy', note: 'Clearing customs', daysAgo: 1 },
      { status: ShipmentStatus.IN_TRANSIT, location: 'Milan, Italy', note: 'Cleared, en route to depot', daysAgo: 0 },
    ],
  },
  {
    trackingNumber: 'CTL-7712-5560',
    status: ShipmentStatus.DELIVERED,
    origin: 'Copenhagen, Denmark',
    destination: 'Hamburg, Germany',
    senderName: 'DK Freight Co',
    receiverName: 'Hansa Logistics GmbH',
    weightKg: 320,
    service: 'Parcel Delivery',
    events: [
      { status: ShipmentStatus.PICKED_UP, location: 'Copenhagen, Denmark', note: 'Picked up', daysAgo: 3 },
      { status: ShipmentStatus.IN_TRANSIT, location: 'Border crossing', note: 'In transit', daysAgo: 2 },
      { status: ShipmentStatus.OUT_FOR_DELIVERY, location: 'Hamburg, Germany', note: 'Out for delivery', daysAgo: 1 },
      { status: ShipmentStatus.DELIVERED, location: 'Hamburg, Germany', note: 'Delivered — signed by M. Weber', daysAgo: 0 },
    ],
  },
];

async function main() {
  // Admin
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });

  // Content
  for (const [key, value] of Object.entries(CONTENT)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object },
    });
  }

  // Email templates
  await prisma.emailTemplate.upsert({
    where: { name: 'Shipment Update' },
    update: {},
    create: {
      name: 'Shipment Update',
      subject: 'Update on your shipment {{trackingNumber}}',
      bodyHtml:
        '<p>Hello,</p><p>Your shipment <strong>{{trackingNumber}}</strong> is now <strong>{{status}}</strong> at {{location}}.</p><p>Track it live: {{trackingUrl}}</p><p>— Cargo Transportation Logistics</p>',
    },
  });

  // Shipments + events
  for (const s of DEMO_SHIPMENTS) {
    const { events, ...data } = s;
    const shipment = await prisma.shipment.upsert({
      where: { trackingNumber: s.trackingNumber },
      update: {},
      create: { ...data, estimatedDelivery: new Date(Date.now() + 3 * 864e5) },
    });
    // clear + recreate events
    await prisma.trackingEvent.deleteMany({ where: { shipmentId: shipment.id } });
    for (const e of events) {
      await prisma.trackingEvent.create({
        data: {
          shipmentId: shipment.id,
          status: e.status,
          location: e.location,
          note: e.note,
          occurredAt: new Date(Date.now() - e.daysAgo * 864e5),
        },
      });
    }
  }

  console.log('Seed complete: admin, content, templates, demo shipments.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
