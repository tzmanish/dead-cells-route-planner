export function darkenedBackgroundImage(link: string):string {
    return `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${link})`;
}