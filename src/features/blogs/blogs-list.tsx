'use client';

import { INotionPageResponse } from '@/data-access/models/notion-page';
import { useGetPagesQuery } from '@/data-access/queries/use-pages-';
import { AsyncComponent } from '@/libs/components/async-component/async-component';
import { BlogCard } from '@/libs/components/blog-card/blog-card';
import { BlogCardLoading } from '@/libs/components/blog-card/blog-card-loading';

export const BlogsList = ({ limit }: { limit?: number }) => {
  const { data: response, isError, isLoading, isSuccess, isFetched } = useGetPagesQuery();
  const posts = (response?.results ?? []) as INotionPageResponse[];
  const limitedPosts = limit ? posts.slice(0, limit) : posts;

  return (
    <AsyncComponent
      isError={isError}
      isLoading={isLoading}
      isSuccess={isSuccess || isFetched}
      Loading={Array.from({ length: limit ? 3 : 6 }).map((_, index) => (
        <BlogCardLoading key={index} />
      ))}
      Success={limitedPosts.map((post) => {
        const title = post.properties.Name.title[0]?.plain_text || 'Untitled';
        const published_date = post.properties.published_date.date.start;
        const tags = (post.properties.tags.multi_select?.map((tag: any) => tag.name) || []).join(', ');
        const id = post.id;
        const status = post.properties.status.status.name;

        return (
          <BlogCard
            key={post.id}
            href={`/blogs/${id}`}
            category={tags}
            date={published_date}
            title={title}
            status={status}
          />
        );
      })}
    />
  );
};
