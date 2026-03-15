export const streamRelocationPlan = async (prompt, onUpdate, onComplete, onError) => {
    try {
        const response = await fetch("http://localhost:8000/api/relocate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error(`Server connection failed: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const dataStr = line.replace("data: ", "").trim();
                    if (!dataStr) continue;

                    try {
                        const data = JSON.parse(dataStr);

                        if (data.report) {
                            onComplete(data.report);
                        } else if (data.error) {
                            onError(data.error);
                        } else if (data.status) {
                            onUpdate(data);
                        }
                    } catch (err) {
                        console.error("Error parsing stream data:", err);
                    }
                }
            }
        }
    } catch (error) {
        onError(error.message);
    }
};