import "../index.css";

export function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <>
        <h1 className="text-xl font-bold">© {currentYear}</h1>
        </>
    );
}