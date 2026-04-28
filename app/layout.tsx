import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { company } from '@/lib/site';

export const metadata = {

  title: "Sirajuddin Software Technologies",

  description: "WeldWise Assistant Software Platform",

};

export default function RootLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  return (

    <html lang="en">

      <body>{children}</body>

    </html>

  );

}


export const metadata = {

  title: "Sirajuddin Software Technologies",

  description: "WeldWise Assistant Software Platform",

};

export default function RootLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  return (

    <html lang="en">

      <body>{children}</body>

    </html>

  );

}