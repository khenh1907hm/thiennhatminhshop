"use client";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b border-outline-variant bg-surface/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-outline hover:text-on-surface transition-colors relative">
            <span className="sr-only">Xem thông báo</span>
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error animate-pulse"></span>
          </button>
          
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-outline-variant" aria-hidden="true" />
          
          <div className="relative">
            <button className="-m-1.5 flex items-center p-1.5 gap-x-3 rounded-xl hover:bg-surface-container-low transition-colors px-2 py-1">
              <span className="sr-only">Mở menu người dùng</span>
              <img
                className="h-8 w-8 rounded-full bg-surface-container-high border border-outline-variant object-cover"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold leading-6 text-on-surface" aria-hidden="true">
                  Admin User
                </span>
                <span className="material-symbols-outlined ml-2 text-outline text-[20px]">
                  expand_more
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
