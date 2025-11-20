import React from "react";
import logoUcu from "../../assets/logo_ucu_40_color.svg";
import backgroundImage from "../../assets/background.jpg";
import Login from "./Login";

export default function UCUPage() {
  return (
    <div className="w-full min-h-screen flex flex-col font-sans bg-gray-50">

      {/* TOP BLUE BAR */}
      <div className="w-full bg-[#003876] text-white text-sm py-2 px-4 flex justify-end gap-6">
        <a href="#" className="hover:underline">Webasignatura</a>
        <a href="#" className="hover:underline">Correo</a>
        <a href="#" className="hover:underline">Biblioteca</a>
        <a href="#" className="hover:underline">Contacto</a>
      </div>

      {/* HEADER */}
      <header className="w-full bg-white shadow">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <img src={logoUcu} alt="UCU Logo" className="h-12"  />
          <nav className="hidden md:flex gap-6 text-gray-700 font-semibold">
            <a href="#" className="hover:text-[#003876]">Nosotros</a>
            <a href="#" className="hover:text-[#003876]">Experiencia UCU</a>
            <a href="#" className="hover:text-[#003876]">Investigación</a>
            <a href="#" className="hover:text-[#003876]">Internacionales</a>
            <a href="#" className="hover:text-[#003876]">English</a>
            <a href="#" className="hover:text-[#003876]">Campus</a>
          </nav>

          <input
            type="text"
            placeholder="Buscar..."
            className="border rounded px-3 py-1 text-sm"
          />
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative w-full h-[420px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative text-center text-white">
          <h1 className="text-6xl font-extrabold tracking-wide">ESTUDIANTES</h1>
          <div className="w-24 h-1 bg-yellow-400 mx-auto mt-4"></div>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 py-16 px-6">
        <Card title="Autogestión Estudiantil" />
        <Card title="WebAsignatura" />
        <Card title="Reserva de salas" onClick={() => {return <Login/>
        }} />
        <Card title="Guía del Estudiante" />
        <Card title="Correo Estudiantil" />
        <Card title="Asistencia Remota" />
      </section>

    </div>
  );
}

function Card({ title, onClick }) {
  return (
    <div onClick={onClick} className="bg-white shadow-md hover:shadow-xl transition rounded-xl p-10 cursor-pointer border-2 border-[#003876] text-center">
      <h2 className="text-xl font-bold text-[#003876] mb-2 uppercase tracking-wide">{title}</h2>
      <span className="text-[#003876] text-4xl font-black">+</span>
    </div>
  );
}