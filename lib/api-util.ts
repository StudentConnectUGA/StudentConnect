export function buildWhereFromQuery(q?: string) {
    if (!q) return {};
    const trimmed = q.trim();
    if (!trimmed) return {};

    const [first, second] = trimmed.split(/\s+/, 2);

    // Detect patterns like "CSCI 1301", "MATH 2250H", etc.
    const looksLikePrefix = /^[A-Za-z]{2,5}$/.test(first);      // e.g., CSCI, MATH, BIOL
    const looksLikeNumber = /^[0-9]{3,4}[A-Za-z]*$/.test(second || ""); // 1301, 2250, 1107H

    if (second && looksLikePrefix && looksLikeNumber) {
        // Treat as DEPT + NUMBER search
        return {
            AND: [
                {
                    prefix: {
                        contains: first,
                        mode: "insensitive",
                    },
                },
                {
                    number: {
                        contains: second,
                        mode: "insensitive",
                    },
                },
            ],
        };
    }

    // Generic search: match in prefix, number, or title
    return {
        OR: [
            { prefix: { contains: trimmed, mode: "insensitive" } },
            { number: { contains: trimmed, mode: "insensitive" } },
            { title: { contains: trimmed, mode: "insensitive" } },
        ],
    };
}
