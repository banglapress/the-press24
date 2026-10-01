import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPitch } from "@/lib/press/server";

export function PitchDialog({ label = "বিষয় পাঠান" }: { label?: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topicNote, setTopicNote] = useState("");
  const mutation = useMutation({
    mutationFn: () => submitPitch({ data: { title, topicNote } }),
    onSuccess: () => {
      setTitle("");
      setTopicNote("");
      setOpen(false);
      toast.success("ভিডিও রিভিউয়ের গেটে গেছে");
      void queryClient.invalidateQueries({ queryKey: ["pieces"] });
      void queryClient.invalidateQueries({ queryKey: ["my-report"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "পাঠানো যায়নি");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>বিষয়ের পিচ</DialogTitle>
          <DialogDescription>
            যে কেউ পাঠাতে পারেন। ভিডিও রিভিউ পাস করে একজন স্ক্রিপ্ট রাইটার অ্যাসাইন করলেই তার কিউতে যাবে।
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <Label htmlFor="title">শিরোনাম</Label>
            <Input
              id="title"
              className="mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: ছাদে সবজি"
              required
            />
          </div>
          <div>
            <Label htmlFor="brief">ব্রিফ</Label>
            <Textarea
              id="brief"
              className="mt-2"
              value={topicNote}
              onChange={(e) => setTopicNote(e.target.value)}
              placeholder="কোণ, সীমা, যা চাই না"
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            প্লানি এডিটরকে পাঠান
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
