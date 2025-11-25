import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/tesla.jpg';

const videoConstraints = {
  width: 640,
  height: 640,
  facingMode: 'user'
};

const initialForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user'
};

const mapDirectionsUrl = 'https://www.google.com/maps/place/Tesla+Giga+Nevada/@39.5513997,-119.3203626,15z/data=!3m1!4b1!4m6!3m5!1s0x80991b3be3441b1f:0x356fda1546f39979!8m2!3d39.5513997!4d-119.3203626!16s%2Fg%2F11b7f5b1mz?entry=ttu';
const mapEmbedSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3106.86463839358!2d-119.32255132383202!3d39.551399671574026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80991b3be3441b1f%3A0x356fda1546f39979!2sTesla%20Giga%20Nevada!5e0!3m2!1sen!2sus!4v1732500000000!5m2!1sen!2sus';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoData, setPhotoData] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const webcamRef = useRef(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoData(reader.result.toString());
      setPhotoError('');
      Swal.fire({
        icon: 'success',
        title: 'Photo uploaded',
        text: 'We will optimize it into a 2x2 badge automatically.',
        timer: 1600,
        showConfirmButton: false
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) {
      toast.error('Unable to capture image. Please try again.');
      return;
    }
    setPhotoData(screenshot);
    setPhotoError('');
    setCameraOpen(false);
    Swal.fire({
      icon: 'success',
      title: 'Photo captured',
      text: 'Preview updated with a 2x2 crop.',
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Password and confirm password must match');
      return;
    }
    if (!photoData) {
      setPhotoError('Profile photo is required');
      toast.error('Please capture or upload a 2x2 photo');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        suffix: form.suffix,
        email: form.email,
        password: form.password,
        role: form.role,
        photoData
      };

      await register(payload);
      setForm(initialForm);
      setPhotoData('');

      await Swal.fire({
        icon: 'success',
        title: 'Registration received',
        text: 'Check your email for the OTP code. Redirecting to login…',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      navigate('/login');
    } catch (error) {
      // toast handled inside context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/5 bg-[#0e0f13]/95 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="hidden flex-col justify-between border-r border-white/5 bg-gradient-to-b from-primary/10 to-transparent px-10 py-12 text-white md:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Instant Access</p>
              <h2 className="mt-4 font-heading text-3xl leading-tight">Tesla Manufacturing & Quality Cloud</h2>
              <p className="mt-3 text-sm text-slate-300">Centralized document control for operations, QA, and engineering. Create an account to upload, review, and approve live procedures.</p>
            </div>
            <ul className="space-y-4 text-sm text-slate-200">
              {['Secure JWT authentication', 'Role-based permissions', 'Live previews & instant downloads'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/50 text-xs">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-8 py-10 md:px-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <img src={logo} alt="Tesla" className="h-14 w-14 rounded-full border border-white/10 object-cover" />
              <p className="mt-3 text-xs uppercase tracking-[0.35em] text-primary/80">Tesla Ops</p>
              <h1 className="font-heading text-3xl text-white">Create your access</h1>
              <p className="text-sm text-slate-400">Invite teammates or request elevated privileges later.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-slate-300">First name</span>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) => handleChange('firstName', event.target.value)}
                    required
                    placeholder="Melanie"
                    className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-300">Middle name</span>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={(event) => handleChange('middleName', event.target.value)}
                    required
                    placeholder="Quality"
                    className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-300">Last name</span>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) => handleChange('lastName', event.target.value)}
                    required
                    placeholder="Engineer"
                    className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-300">Suffix (optional)</span>
                  <input
                    type="text"
                    value={form.suffix}
                    onChange={(event) => handleChange('suffix', event.target.value)}
                    placeholder="Jr., Sr., PE"
                    className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Work email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  required
                  placeholder="engineer@tesla.com"
                  className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Password</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-xs uppercase tracking-[0.3em] text-primary"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    required
                    minLength={6}
                    placeholder="Strong & memorable"
                    className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                  />
                  <p className="text-xs text-slate-500">Minimum 6 characters. Mix numbers & symbols for extra strength.</p>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-slate-300">Confirm password</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(event) => handleChange('confirmPassword', event.target.value)}
                    required
                    placeholder="Repeat password"
                    className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm">
                <span className="text-slate-300">Role</span>
                <select
                  value={form.role}
                  onChange={(event) => handleChange('role', event.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-black/30 px-4 py-3 text-white focus:border-primary focus:outline-none"
                >
                  <option value="user">Engineer / Operator</option>
                  <option value="admin">Admin (approval required)</option>
                </select>
                <p className="text-xs text-slate-500">Admin requests are reviewed before elevated access is granted.</p>
              </label>

              <div className="space-y-3 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span>2x2 profile photo</span>
                  {photoError && <span className="text-xs text-red-400">{photoError}</span>}
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="mx-auto h-32 w-32 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    {photoData ? (
                      <img src={photoData} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-center text-xs text-slate-500">
                        2x2 preview
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-wrap gap-3 text-xs uppercase tracking-[0.3em]">
                    <label className="flex-1 cursor-pointer rounded-2xl border border-white/10 px-4 py-3 text-center text-white transition hover:border-primary hover:bg-primary/10">
                      Upload photo
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setCameraOpen(true)}
                      className="flex-1 rounded-2xl border border-primary/40 px-4 py-3 text-white transition hover:bg-primary/10"
                    >
                      Use camera
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Upload a clear headshot. Camera captures are auto-cropped to a 2x2 badge.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-glow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Creating account…' : 'Launch workspace'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have access?{' '}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <section className="mt-8 w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0a0b10] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Nevada Operations</p>
            <h3 className="font-heading text-2xl text-white">Tesla Giga Nevada</h3>
            <p className="mt-2 text-sm text-slate-400">
              Fully responsive embedded map below. Pinch, zoom, or open directly in Google Maps for turn-by-turn
              directions when visiting the quality engineering command center.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em]">
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-primary/50 px-4 py-2 text-primary transition hover:bg-primary hover:text-white"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
          <div className="h-48 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 md:h-52 md:w-1/2">
            <iframe
              title="Tesla Giga Nevada Map"
              src={mapEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <footer className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-slate-500">
        <a
          href={mapDirectionsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          Tesla near Nevada, USA · Google Maps
        </a>
        <p className="mt-2 text-[0.8rem] normal-case tracking-normal text-slate-400">
          Made by Facebook · Melanie Chavaria Birmingham · Quality Engineering
        </p>
      </footer>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e0f13] p-6 text-white shadow-[0_25px_90px_rgba(0,0,0,0.65)]">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Live capture</p>
            <h3 className="font-heading text-2xl">Use your camera</h3>
            <p className="text-sm text-slate-400">Align your face inside the square frame for best results.</p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCapture}
                className="flex-1 rounded-2xl bg-primary py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white"
              >
                Capture photo
              </button>
              <button
                type="button"
                onClick={() => setCameraOpen(false)}
                className="flex-1 rounded-2xl border border-white/10 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300 hover:border-primary hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
