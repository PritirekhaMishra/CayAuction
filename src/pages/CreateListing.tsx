import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Clock, Tag, DollarSign, Image as ImageIcon, ChevronRight, Sparkles } from "lucide-react";

const categories = [
  { id: "luxury-car", label: "Luxury Car", icon: "🚗" },
  { id: "villa", label: "Villa", icon: "🏛️" },
  { id: "watch", label: "Watch", icon: "⌚" },
  { id: "art", label: "Art", icon: "🎨" },
  { id: "jewelry", label: "Jewelry", icon: "💎" },
  { id: "collectibles", label: "Collectibles", icon: "🏆" }
];

const CreateListing = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("luxury-car");

  const [days, setDays] = useState("1");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");

  const [images, setImages] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);


const [uploadProgress, setUploadProgress] = useState(0);
const [uploading, setUploading] = useState(false);
const [abortController, setAbortController] = useState<AbortController | null>(null);
const [video, setVideo] = useState<File | null>(null);
const [videoUrl, setVideoUrl] = useState<string | null>(null);
  // IMAGE HANDLER
  const handleImages = (e: any) => {
  const files = Array.from(e.target.files);

  if (files.length > 5) {
    alert("Maximum 5 images allowed");
    return;
  }

  if (files.length > 0) {
    setImages(files as File[]);
    const previews = files.map((file: any) => URL.createObjectURL(file));
    setPreview(previews);
  }
};

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);

  const files = Array.from(e.dataTransfer.files);

  if (files.length > 5) {
    alert("Maximum 5 images allowed");
    return;
  }

  setImages(files as File[]);
  const previews = files.map((file: any) => URL.createObjectURL(file));
  setPreview(previews);
};
  

const cancelUpload = () => {
  if (abortController) {
    abortController.abort();
    setUploadProgress(0);
  }
};
{uploading && (
  <div className="mt-4 space-y-2">

    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
      <div
        className="bg-amber-500 h-full transition-all duration-300"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>

    <div className="flex justify-between items-center text-sm text-gray-300">
      <span>Uploading... {uploadProgress}%</span>

      <button
        onClick={cancelUpload}
        className="text-red-400 hover:text-red-300"
      >
        Cancel
      </button>
    </div>

  </div>
)}
const openUploadWidget = () => {
  const widget = (window as any).cloudinary.createUploadWidget(
    {
      cloudName: "dwmokcagc",
      uploadPreset: "auction_upload",

      resourceType: "video",   // 🚨 MUST ADD THIS
      clientAllowedFormats: ["mp4", "mov", "webm"],

      maxFileSize: 300000000
    },
    (error: any, result: any) => {
      if (!error && result.event === "success") {
        console.log("UPLOAD SUCCESS:", result.info.secure_url);
        setVideoUrl(result.info.secure_url);
        {!videoUrl && video && <p>Uploading video...</p>}
      }
    }
  );

  widget.open();
};
  // SUBMIT
  const handleSubmit = async () => {
  if (!title || !price || !description || !category) {
    alert("Fill all required fields");
    return;
  }

  const totalHours =
    parseInt(days || "0") * 24 +
    parseInt(hours || "0") +
    parseInt(minutes || "0") / 60;

  if (totalHours <= 0) {
    alert("Duration must be > 0");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("starting_price", price.toString());
    formData.append("end_time_duration_hours", totalHours.toString());

    // ✅ FIX: must match backend field name EXACTLY
    images.forEach((img) => {
      formData.append("images", img);
    });

    

if (video && !videoUrl) {
  alert("Wait for video upload to finish");
  return;
}

if (videoUrl) {
  formData.append("video", videoUrl);
}

    const res = await fetch("http://127.0.0.1:8000/api/listings/create/", {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const data = await res.json();

if (!res.ok) {
  alert(data.error || JSON.stringify(data));
  return;
}

// ✅ FIX: extract listing_id
const listingId = data.listing_id;

console.log("Listing ID:", listingId);

alert("Listing created successfully");

// optional use
// navigate(`/listing/${listingId}`);

// or keep your current:
navigate("/seller-dashboard");

  } catch (err) {
    alert("Server error");
  } finally {
    setLoading(false);
  }
};
const handleVideo = (file: File) => {
  if (file.size > 300 * 1024 * 1024) {
    alert("Video must be under 300MB");
    return;
  }

  const videoEl = document.createElement("video");

  videoEl.preload = "metadata";
  videoEl.onloadedmetadata = () => {
    URL.revokeObjectURL(videoEl.src);

    if (videoEl.duration > 180) {
      alert("Video must be under 3 minutes");
      return;
    }

    setVideo(file);

    // ✅ FIX: OPEN CLOUDINARY UPLOAD
    openUploadWidget();   // 🔥 THIS WAS MISSING
  };

  videoEl.src = URL.createObjectURL(file);
};
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = preview.filter((_, i) => i !== index);
    setImages(newImages);
    setPreview(newPreviews);
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans selection:bg-amber-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-amber-400 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Premium Listing</span>
          </div>
          <h1 className="text-5xl font-light tracking-tight text-white">
            List Your <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Luxury Asset</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Showcase your exclusive item to our network of discerning collectors and buyers worldwide.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/5">
            <div className="h-full w-1/3 bg-gradient-to-r from-amber-500 to-amber-300" />
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* Section 1: Basic Information */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Asset Details</h2>
                  <p className="text-sm text-slate-400">Basic information about your listing</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">
                    Asset Title <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 2024 Rolls-Royce Phantom"
                    className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">
                    Starting Price <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the condition, history, and unique features of your asset..."
                  rows={4}
                  className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-slate-600 text-white resize-none"
                />
              </div>
            </section>

            {/* Section 2: Category Selection */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Category</h2>
                  <p className="text-sm text-slate-400">Select the type of luxury asset</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                      category === c.id
                        ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="text-2xl mb-2">{c.icon}</div>
                    <div className={`text-sm font-medium ${category === c.id ? "text-amber-400" : "text-slate-300"}`}>
                      {c.label}
                    </div>
                    {category === c.id && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Section 3: Auction Duration */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Auction Duration</h2>
                  <p className="text-sm text-slate-400">Set how long your auction will run</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Days</label>
                  <input
                    type="number"
                    min="0"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-center text-lg font-semibold text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-center text-lg font-semibold text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-center text-lg font-semibold text-white"
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Image Upload */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Media Upload</h2>
                  <p className="text-sm text-slate-400">Add high-quality images of your asset</p>
                </div>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/[0.07]"
                }`}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleImages}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                  
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Drop images here or click to browse</p>
                    <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG, WebP up to 10MB each</p>
                  </div>
                </div>
              </div>

              {preview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {preview.map((img, i) => (
                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      <img
                        src={img}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => removeImage(i)}
                          className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-white text-sm rounded-lg backdrop-blur-sm transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* video overview */}
              {videoUrl && (
  <div className="mt-6">
    <p className="text-sm text-slate-400 mb-2">Video Preview</p>

    <video
      src={videoUrl}
      controls
      className="w-full max-w-md rounded-xl border border-[#C9A84C]/30 shadow-lg"
    />
  </div>
)}
              {/* VIDEO UPLOAD */}
<div className="mt-6 space-y-2">
  <label className="text-sm text-slate-300 ml-1">
    Upload Video (Max 3 min)
  </label>

  <input
  type="file"
  accept="video/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleVideo(file);   // ✅ CORRECT
  }}
  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white"
/>
</div>
            </section>

            {/* Submit Section */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-400">
                  <span className="text-amber-500">*</span> Required fields
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Listing</span>
                      <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-sm mt-8">
          All listings are reviewed by our team before going live. This usually takes 24-48 hours.
        </p>
      </div>
    </div>
  );
};

export default CreateListing;