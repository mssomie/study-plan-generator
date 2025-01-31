import { CssBaseline } from "@mui/material";
import { Banner } from "@/components/Banner";
import { Services } from "@/components/Services";

export default function Home() {
  return (
    <>
      <CssBaseline />
      <Banner />
      <Services />
    </>
  );
}
