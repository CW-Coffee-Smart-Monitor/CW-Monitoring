type ProfileCardProps = {
  name: string;
  email: string;
  imageUrl: string;
  membership: string;
};

export default function ProfileCard({
  name,
  email,
  imageUrl,
  membership,
}: ProfileCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-neutral-200">
      <div className="relative">
        <img
          src={imageUrl}
          alt={name}
          className="h-14 w-14 rounded-full object-cover"
        />
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-neutral-900">{name}</h3>
        <p className="text-sm text-neutral-500">{email}</p>

        <span className="mt-1 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          {membership}
        </span>
      </div>
    </div>
  );
}