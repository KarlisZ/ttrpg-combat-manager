export function generateNextName(baseName: string, existingNames: string[]): string {
    const existingSet = new Set(existingNames);
    
    // Regex to match "Name" or "Name 123"
    // Captures: 1=Name (trimmed), 2=Number
    // We treat the last space-separated number as the counter
    const match = baseName.match(/^(.*?)(?:\s+(\d+))?$/);
    
    if (!match) return baseName; // Fallback
    
    const root = match[1];
    const numStr = match[2];
    
    // Case 1: No number suffix (e.g. "Monster")
    if (!numStr) {
        // If the exact name is available, return it.
        // This handles the case where we just want the base name and it's free.
        if (!existingSet.has(baseName)) {
            return baseName;
        }
        
        // If the base name is taken, start sequence at 1
        // Example: "Monster" exists -> return "Monster 1"
        let i = 1;
        while (true) {
            const candidate = `${baseName} ${i}`;
            if (!existingSet.has(candidate)) return candidate;
            i++;
        }
    }
    
    // Case 2: Has number suffix (e.g. "Monster 1")
    // Increment starting from the next number
    let i = parseInt(numStr, 10) + 1;
    while (true) {
        const candidate = `${root} ${i}`;
        if (!existingSet.has(candidate)) return candidate;
        i++;
    }
}
