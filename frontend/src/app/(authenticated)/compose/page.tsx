"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSendMessageMutation } from "@/api/messagesApi";

const composeSchema = z.object({
  recipient: z.coerce.number().positive("Recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
});

type ComposeForm = z.infer<typeof composeSchema>;

export default function ComposePage() {
  const router = useRouter();
  const [sendMessage, { isLoading, error }] = useSendMessageMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComposeForm>({
    resolver: zodResolver(composeSchema),
  });

  const onSubmit = async (data: ComposeForm) => {
    try {
      await sendMessage(data).unwrap();
      router.push("/sent");
    } catch {
      // Error handled by RTK Query
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-3 md:px-6 py-3 md:py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 flex flex-col"
      >
        <div className="border-b border-gray-100 px-3 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <label
              htmlFor="recipient"
              className="text-sm text-gray-500 w-12"
            >
              To
            </label>
            <input
              {...register("recipient")}
              id="recipient"
              type="number"
              placeholder="User ID"
              className="flex-1 border-0 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
          {errors.recipient && (
            <p className="mt-1 ml-15 text-xs text-red-500">
              {errors.recipient.message}
            </p>
          )}
        </div>

        <div className="border-b border-gray-100 px-3 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <label
              htmlFor="subject"
              className="text-sm text-gray-500 w-12"
            >
              Subject
            </label>
            <input
              {...register("subject")}
              id="subject"
              type="text"
              placeholder="Subject"
              className="flex-1 border-0 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
          {errors.subject && (
            <p className="mt-1 ml-15 text-xs text-red-500">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div className="flex-1 px-3 md:px-6 py-4">
          <textarea
            {...register("body")}
            placeholder="Write your message..."
            className="w-full h-full resize-none border-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 leading-relaxed"
          />
          {errors.body && (
            <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>
          )}
        </div>

        {error && (
          <div className="px-6 pb-2">
            <p className="text-xs text-red-500">
              Failed to send message. Please try again.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 md:px-6 py-3 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}
