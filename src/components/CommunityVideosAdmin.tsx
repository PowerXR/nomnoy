import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Video,
  ExternalLink
} from "lucide-react";
import { CommunityVideo } from "../types";

interface Props {
  onClose: () => void;
}

export default function CommunityVideosAdmin({
  onClose
}: Props) {
  const [videos, setVideos] = useState<CommunityVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] =
    useState("");
  const [description, setDescription] =
    useState("");
  const [productName, setProductName] =
    useState("");

  const loadVideos = async () => {
    try {
      const response = await fetch(
        "/api/admin/community-videos",
        {
          headers: {
            "X-User-Role": "admin"
          }
        }
      );

      const data = await response.json();

      setVideos(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setYoutubeUrl("");
    setDescription("");
    setProductName("");
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("กรุณากรอกชื่อวิดีโอ");
      return;
    }

    if (!youtubeUrl.trim()) {
      alert("กรุณาใส่ลิงก์ YouTube");
      return;
    }

    const payload = {
      title,
      youtubeUrl,
      description,
      productName
    };

    try {
      const url = editingId
        ? `/api/admin/community-videos/${editingId}`
        : "/api/admin/community-videos";

      const response = await fetch(url, {
        method: editingId
          ? "PUT"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",
          "X-User-Role": "admin"
        },

        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
          "เกิดข้อผิดพลาด"
        );
        return;
      }

      alert(
        editingId
          ? "แก้ไขวิดีโอเรียบร้อยแล้ว"
          : "เพิ่มวิดีโอเรียบร้อยแล้ว"
      );

      resetForm();
      await loadVideos();

    } catch (error) {
      console.error(error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const handleEdit = (
    video: CommunityVideo
  ) => {
    setEditingId(video.id);
    setTitle(video.title);
    setYoutubeUrl(video.youtubeUrl);
    setDescription(
      video.description || ""
    );
    setProductName(
      video.productName || ""
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (
    id: string
  ) => {
    if (
      !confirm(
        "ต้องการลบวิดีโอนี้ใช่หรือไม่?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/community-videos/${id}`,
        {
          method: "DELETE",
          headers: {
            "X-User-Role": "admin"
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
          "ไม่สามารถลบได้"
        );
        return;
      }

      await loadVideos();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto p-4">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-[#8E6D4E] flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                จัดการวิดีโอผลิตภัณฑ์ชุมชน
              </h1>

              <p className="text-white/50 text-sm">
                เพิ่มคลิปจาก YouTube ของทางเทศบาล
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
          >
            <X />
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-5 sm:p-6 mb-8"
        >

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-bold text-gray-900">
              {editingId
                ? "แก้ไขวิดีโอ"
                : "เพิ่มวิดีโอใหม่"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                ยกเลิกการแก้ไข
              </button>
            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-semibold mb-2">
                ชื่อวิดีโอ *
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="เช่น วิธีทำสบู่สมุนไพร"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#8E6D4E]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                ผลิตภัณฑ์
              </label>

              <input
                value={productName}
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
                placeholder="เช่น สบู่สมุนไพร"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#8E6D4E]"
              />
            </div>

          </div>

          <div className="mt-4">

            <label className="block text-sm font-semibold mb-2">
              ลิงก์ YouTube *
            </label>

            <input
              value={youtubeUrl}
              onChange={(e) =>
                setYoutubeUrl(
                  e.target.value
                )
              }
              placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#8E6D4E]"
            />

            <p className="text-xs text-gray-500 mt-2">
              รองรับ youtube.com/watch, youtu.be และ youtube.com/embed
            </p>

          </div>

          <div className="mt-4">

            <label className="block text-sm font-semibold mb-2">
              รายละเอียด
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={4}
              placeholder="รายละเอียดเกี่ยวกับคลิป..."
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#8E6D4E] resize-none"
            />

          </div>

          <div className="flex justify-end mt-5">

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#8E6D4E] hover:bg-[#765a41] text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              <Plus className="w-5 h-5" />

              {editingId
                ? "บันทึกการแก้ไข"
                : "เพิ่มวิดีโอ"}
            </button>

          </div>

        </form>

        {/* List */}
        <div className="space-y-4">

          {loading ? (
            <div className="text-center text-white py-10">
              กำลังโหลด...
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center text-white/50 py-10">
              ยังไม่มีวิดีโอ
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-3xl overflow-hidden"
              >

                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_auto]">

                  {/* Thumbnail */}
                  <div className="aspect-video md:aspect-auto bg-black">

                    {video.thumbnailUrl && (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}

                  </div>

                  {/* Information */}
                  <div className="p-5">

                    <h3 className="text-lg font-bold text-gray-900">
                      {video.title}
                    </h3>

                    {video.productName && (
                      <p className="text-[#8E6D4E] text-sm mt-1">
                        ผลิตภัณฑ์:{" "}
                        {video.productName}
                      </p>
                    )}

                    <p className="text-gray-500 text-sm mt-3 line-clamp-3">
                      {video.description ||
                        "ไม่มีรายละเอียด"}
                    </p>

                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 mt-3"
                    >
                      <ExternalLink className="w-4 h-4" />
                      ดูบน YouTube
                    </a>

                  </div>

                  {/* Actions */}
                  <div className="p-5 flex md:flex-col gap-2 justify-end">

                    <button
                      onClick={() =>
                        handleEdit(video)
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800"
                    >
                      <Pencil className="w-4 h-4" />
                      แก้ไข
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(video.id)
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      ลบ
                    </button>

                  </div>

                </div>

              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}
