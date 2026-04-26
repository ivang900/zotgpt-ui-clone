import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { StateView } from "@/components/StateView";
import { ParityChrome } from "@/components/ParityChrome";
import { StatesIndex } from "@/pages/StatesIndex";
import { STATES_BY_SLUG, STATES } from "@/lib/states";

function StateRoute() {
  const { slug } = useParams();
  const state = slug ? STATES_BY_SLUG[slug] : undefined;
  if (!state) return <Navigate to="/states" replace />;
  return (
    <>
      <StateView state={state} />
      <ParityChrome forcedTheme={state.forcedTheme} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${STATES[0].slug}`} replace />} />
      <Route path="/states" element={<><StatesIndex /><ParityChrome /></>} />
      <Route path="/:slug" element={<StateRoute />} />
      <Route path="/chat/:id" element={<Navigate to={`/chat-with-messages`} replace />} />
      <Route path="*" element={<Navigate to="/states" replace />} />
    </Routes>
  );
}
