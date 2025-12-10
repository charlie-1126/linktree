import { useState } from "react";
import { Navigation } from "./Navigation";
import { CodingStats } from "./CodingStats";
import { ProjectSekai } from "./ProjectSekai";

export function StatsPage() {
    return (
        <div className="space-y-4 sm:space-y-5">
            <CodingStats />
            <ProjectSekai />
        </div>
    );
}
