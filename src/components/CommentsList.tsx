import { HNComment } from '../types';
import { Comment } from './Comment';
import { styled } from '../theme';

interface CommentsListProps {
  comments: HNComment[];
  selectedIndex: number;
  availableWidth: number;
  expandedComments: Set<number>;
  loadingComments: Set<number>;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

export const CommentsList = ({
  comments,
  selectedIndex,
  availableWidth,
  expandedComments,
  loadingComments,
  loading,
  loadingMore,
  error
}: CommentsListProps) => {
  if (loading) {
    return <text>{styled.secondary('Loading comments...')}</text>;
  }

  if (error) {
    return <text>{styled.error(`Error loading comments: ${error}`)}</text>;
  }

  if (!loading && comments.length === 0 && !error) {
    return <text>{styled.secondary('No comments yet.')}</text>;
  }

  return (
    <box flexDirection="column">
      {comments.map((comment, index) => (
        <Comment
          key={comment.id}
          comment={comment}
          isSelected={index === selectedIndex}
          availableWidth={availableWidth}
          expandedComments={expandedComments}
          loadingComments={loadingComments}
        />
      ))}
      {loadingMore && (
        <box padding={1}>
          <text>{styled.secondary('Loading more comments...')}</text>
        </box>
      )}
    </box>
  );
};