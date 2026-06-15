import React, { Suspense } from "react";
import CreateTrip from "../components/CreateTrip";

const CreateTripPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <CreateTrip />
    </Suspense>
  );
};

export default CreateTripPage;
