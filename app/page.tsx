import Experience from '../components/Experience';
import Navbar from '../components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Experience variant="home" />
    </>
  );
}