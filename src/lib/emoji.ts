import emojiMap from 'emoji-name-map'

// emojify replaces names of :emojis: in str with their emoji counterpart
//
// ":bathtub" -> "🛁"
export const emojify = (str: string) : string => {
    const matches = str.matchAll(/:[^:\s]*(?:::[^:\s]*)*:/g)
    for (const m of matches) {
        str = str.replaceAll(m[0], emojiMap.get(m[0]))
    }
    return str
}