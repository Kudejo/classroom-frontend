import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb"
import { CreateView } from "@/components/refine-ui/views/create-view.tsx"
import { useBack } from "@refinedev/core";
import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm} from "@refinedev/react-hook-form";
import { classSchema } from "@/lib/schema.ts";
import * as Z from "zod";

import{
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import {Label} from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea";
import {Loader2} from "lucide-react";
import UploadWidget from "@/components/upload-widget.tsx";

const Create = () => {
  const back = useBack();

  const form = useForm({
    resolver: zodResolver(classSchema),
    refineCoreProps: {
      resource: 'classes',
      action: 'create',
    }
  });

  const { handleSubmit, formState: { isSubmitting, errors }, control } = form;

  const onSubmit = (values: Z.infer<typeof classSchema>) => {
    try {
      console.log(values);
    } catch (error) {
      console.error("Error creating class:", error);
    }
  }

 const teachers = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Sarah Johnson" },
  { id: 3, name: "Michael Davis" },
];

 const subjects = [
  { id: 1, name: "Mathematics", code: "MAT" },
  { id: 2, name: "Physics", code: "PHY" },
  { id: 3, name: "Chemistry", code: "CHM" },
  { id: 4, name: "Computer Science", code: "CS" },
];

const bannerPublicId = form.watch("bannerCldPubId");

const setBannerImage = (file: any, field: any) => {
  if (file) {
    field.onChange(file.url);
    form.setValue("bannerCldPubId", file.publicId, {
      shouldValidate: true,
      shouldDirty: true
    })
  } else {
    field.onChange('');
    form.setValue('bannerCldPubId', '', {
      shouldValidate: true,
      shouldDirty: true
    })
  }
}

  return (
    <CreateView className="class-view">
      <Breadcrumb/>
        <h1 className="page-title">Create Class</h1>
        <div className="into-row">
          <p>Provide the required information below to add a class.</p>
          <Button onClick={back}>Go Back</Button>
        </div>

        <Separator />

        <div className="my-4 flex items-center">
          <Card className="clas-form-card">
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl pb-0 font-bold">fill out the form</CardTitle>
            </CardHeader>

            <Separator />

            <CardContent className="mt-7">
              <Form {...form}>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={control}
                                    name="bannerUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                 Banner Image<span className="text-orange-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <UploadWidget
                                                    value={field.value ? { url: 
                                                      field.value, publicId: 
                                                      bannerPublicId ?? '' } : null}
                                                      onChange={(file: any) => setBannerImage(file, field)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            {errors.bannerCldPubId && !errors
                                            .bannerUrl && (
                                              <p className="text-destructive text-sm">{errors.bannerCldPubId.message?.toString()}</p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Class Name <span className="text-orange-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Introduction to Biology - Section A"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="subjectId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Subject <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) =>
                                                        field.onChange(Number(value))
                                                    }
                                                    value={field.value?.toString()}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a subject" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {subjects.map((subject) => (
                                                            <SelectItem
                                                                key={subject.id}
                                                                value={subject.id.toString()}
                                                            >
                                                                {subject.name} ({subject.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="teacherId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Teacher <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select a teacher" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {teachers.map((teacher) => (
                                                            <SelectItem
                                                                key={teacher.id}
                                                                value={teacher.id.toString()}
                                                            >
                                                                {teacher.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="capacity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Capacity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="30"
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            field.onChange(value ? Number(value) : undefined);
                                                        }}
                                                        value={(field.value as number | undefined) ?? ""}
                                                        name={field.name}
                                                        ref={field.ref}
                                                        onBlur={field.onBlur}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Status <span className="text-orange-600">*</span>
                                                </FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Brief description about the class"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <Button type="submit" size="lg" className="w-full">
                                    {isSubmitting ? (
                                        <div className="flex gap-1">
                                            <span>Creating Class...</span>
                                            <Loader2 className="inline-block ml-2 animate-spin" />
                                        </div>
                                    ) : (
                                        "Create Class"
                                    )}
                                </Button>
                            </form>
                        </Form>
            </CardContent>
          </Card>
        </div>

    </CreateView>
  )
}

export default Create