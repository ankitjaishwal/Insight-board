const UnauthorizedPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold text-red-600 mb-2">
        Access Denied
      </h1>
      <p className="text-gray-600">
        You don’t have permission to view this page.
      </p>
    </div>
  );
};

export default UnauthorizedPage;
