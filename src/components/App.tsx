import { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { ProfilePage } from "./ProfilePage";
import { StatsPage } from "./StatsPage";

const SOLVEDAC_CACHE_KEY = "solvedac_cache";
const ATCODER_CACHE_KEY = "atcoder_cache";
const SEKAI_CACHE_KEY = "sekai_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export function App() {
    const [currentPage, setCurrentPage] = useState<"profile" | "stats">("profile");

    useEffect(() => {
        // 앱 초기화 시 모든 데이터 미리 로드 (병렬 처리)
        const prefetchData = async () => {
            const now = Date.now();
            const fetchPromises: Promise<void>[] = [];

            // 캐시 체크 헬퍼 함수
            const shouldFetch = (cacheKey: string): boolean => {
                try {
                    const cached = localStorage.getItem(cacheKey);
                    if (!cached) return true;
                    const { timestamp } = JSON.parse(cached);
                    return now - timestamp >= CACHE_DURATION;
                } catch {
                    return true;
                }
            };

            // API 호출 헬퍼 함수
            const fetchAndCache = async (url: string, cacheKey: string) => {
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: now }));
                } catch (err) {
                    console.error(`Failed to prefetch ${url}:`, err);
                }
            };

            // 필요한 API만 병렬로 호출
            if (shouldFetch(SOLVEDAC_CACHE_KEY)) {
                fetchPromises.push(fetchAndCache("/api/solvedac", SOLVEDAC_CACHE_KEY));
            }
            if (shouldFetch(ATCODER_CACHE_KEY)) {
                fetchPromises.push(fetchAndCache("/api/atcoder", ATCODER_CACHE_KEY));
            }
            if (shouldFetch(SEKAI_CACHE_KEY)) {
                fetchPromises.push(fetchAndCache("/api/sekai", SEKAI_CACHE_KEY));
            }

            // 모든 fetch를 병렬로 실행
            await Promise.all(fetchPromises);
        };

        prefetchData();
    }, []);

    return (
        <>
            <Navigation onPageChange={setCurrentPage} />

            {currentPage === "profile" ? <ProfilePage /> : <StatsPage />}
        </>
    );
}
