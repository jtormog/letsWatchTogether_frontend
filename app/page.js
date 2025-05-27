import Banner from "@/components/banner";
import Section from "@/components/section";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden">
      <Banner/>
      <Section title="Recomendado por tus amigos"/>
      <Section title="Tendencias"/>
      <Section title="Viendo"/>
      <Section title="Recomendado para ti"/>

    </main>
  );
}
