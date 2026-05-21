"use client";

import { useEffect, useState } from "react";
import { getProperties } from "../services/api";
import PropertyCard from "c:/Users/Administrator/Desktop/taiwanhome/components/PropertyCard";
export default function TaiwanHomeWebsite() {
  const [featuredHomes, setFeaturedHomes] = useState([]);

useEffect(() => {
  getProperties().then((data) => {
    setFeaturedHomes(data);
  });
}, []);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-3xl font-black text-red-600">
              Taiwan<span className="text-yellow-500">Home</span>
            </h1>
            <p className="text-sm text-gray-500">
              Bất động sản Đài Loan ・ 台灣房地產
            </p>
          </div>

          <nav className="hidden gap-8 md:flex">
            <a href="#" className="font-medium hover:text-red-600">
              Nhà bán
            </a>
            <a href="#" className="font-medium hover:text-red-600">
              台中
            </a>
            <a href="#" className="font-medium hover:text-red-600">
              台北
            </a>
            <a href="#" className="font-medium hover:text-red-600">
              高雄
            </a>
            <a href="#" className="font-medium hover:text-red-600">
              Liên hệ
            </a>
          </nav>

          <button className="rounded-xl bg-red-600 px-5 py-2 font-semibold text-white shadow hover:bg-red-700">
            LINE Contact
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 to-yellow-500 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur">
              Taiwan Real Estate Platform
            </div>

            <h2 className="mb-6 text-5xl font-black leading-tight">
              TaiwanHome
              <br />
              Nhà đất Đài Loan
            </h2>

            <p className="mb-8 text-lg text-white/90">
              Chuyên đăng bán nhà, căn hộ, biệt thự và bất động sản tại
              Đài Loan.
              <br />
              專業台灣房屋出售平台。
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="rounded-2xl bg-white px-6 py-3 font-bold text-red-600 shadow-lg transition hover:scale-105">
                Xem nhà bán
              </button>

              <button className="rounded-2xl border border-white px-6 py-3 font-bold text-white transition hover:bg-white hover:text-red-600">
                免費諮詢
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 text-gray-800 shadow-2xl">
            <h3 className="mb-5 text-2xl font-bold text-red-600">
              Tìm kiếm bất động sản
            </h3>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Nhập khu vực / 輸入地區"
                className="rounded-xl border p-4 outline-none focus:border-red-500"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <select className="rounded-xl border p-4 outline-none focus:border-red-500">
                  <option>Loại nhà</option>
                  <option>Căn hộ/Chung cư</option>
                  <option>Nhà phố</option>
                  <option>Biệt thự</option>
                </select>

                <select className="rounded-xl border p-4 outline-none focus:border-red-500">
                  <option>Khoảng giá</option>
                  <option>Dưới 10 triệu</option>
                  <option>10 - 20 triệu</option>
                  <option>20 - 50 triệu</option>
                </select>
              </div>

              <button className="rounded-xl bg-red-600 py-4 text-lg font-bold text-white transition hover:bg-red-700">
                Tìm kiếm 搜尋
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-gray-900">
              Nhà nổi bật
            </h2>
            <p className="mt-2 text-gray-500">精選房源推薦</p>
          </div>

          <button className="rounded-xl border border-red-600 px-5 py-3 font-semibold text-red-600 hover:bg-red-600 hover:text-white">
            Xem tất cả
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredHomes.map((home) => (
            <div
              key={home.id}
              className="overflow-hidden rounded-3xl border bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative">
                <img
                  src={home.image}
                  alt={home.title_vi}
                  className="h-72 w-full object-cover"
                />

                <div className="absolute left-4 top-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow">
                  Nhà bán
                </div>
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {home.title_vi}
                </h3>

                <p className="mb-4 text-gray-500">{home.title_zh}</p>

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-2xl font-black text-red-600">
                    {home.price}
                  </span>
                </div>

                <p className="mb-6 text-gray-600">📍 {home.city}</p>

                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="rounded-xl bg-yellow-50 p-3">
                    <p className="font-bold">
  {home.phòngngủ}
</p>
                    <p>Phòng ngủ</p>
                  </div>

                  <div className="rounded-xl bg-yellow-50 p-3">
                    <p className="font-bold">
  {home.phòngtắm}
</p>
                    <p>Phòng tắm</p>
                  </div>

                  <div className="rounded-xl bg-yellow-50 p-3">
                    <p className="font-bold">
  {home.diệntích}
</p>
                    <p>Diện tích</p>
                  </div>
                </div>

                <a
  href={home.link}
  target="_blank"
  className="mt-6 block w-full rounded-2xl bg-red-600 py-4 text-center font-bold text-white transition hover:bg-red-700"
>
  Xem chi tiết 詳細資訊
</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Areas */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-black text-gray-900">
              Khu vực phổ biến
            </h2>
            <p className="mt-3 text-gray-500">熱門城市地區</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              "台中 Taichung",
              "台北 Taipei",
              "高雄 Kaohsiung",
              "台南 Tainan",
            ].map((city) => (
              <div
                key={city}
                className="rounded-3xl bg-white p-8 text-center shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="mb-4 text-5xl">🏠</div>
                <h3 className="text-2xl font-bold text-red-600">{city}</h3>
                <p className="mt-3 text-gray-500">Nhiều bất động sản đẹp</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-red-600 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-5xl font-black">
            Liên hệ đăng bán nhà
          </h2>

          <p className="mt-6 text-xl text-white/90">
            Hỗ trợ đăng bán bất động sản tại Đài Loan nhanh chóng.
            <br />
            免費刊登房屋資訊。
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <button className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-red-600 shadow-lg transition hover:scale-105">
              LINE Contact
            </button>

            <button className="rounded-2xl border border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-red-600">
              Facebook Page
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div>
            <h3 className="text-3xl font-black text-yellow-400">
              TaiwanHome
            </h3>
            <p className="mt-2 text-gray-400">
              Taiwan Real Estate Platform ・ 台灣房地產網站
            </p>
          </div>

          <div className="flex gap-6 text-gray-300">
            <a href="#" className="hover:text-yellow-400">
              Nhà bán
            </a>
            <a href="#" className="hover:text-yellow-400">
              Chính sách
            </a>
            <a href="#" className="hover:text-yellow-400">
              Liên hệ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
