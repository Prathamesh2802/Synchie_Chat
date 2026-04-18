function PageNotFound() {
  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-7xl">
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold text-center">Page Not Found</h1>

          <p className="text-lg text-center pt-10">
            The Page you are trying to access in invalid. Please make sure you
            have selected the correct link
          </p>
        </div>
      </div>
    </div>
  );
}
export default PageNotFound;
