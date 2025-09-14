import { HNComment } from '../types';
import { formatTimeAgo, wrapText, stripHtml } from '../utils';
import { styled, theme } from '../theme';

interface CommentProps {
  key?: number;
  comment: HNComment;
  isSelected: boolean;
  availableWidth: number;
  expandedComments: Set<number>;
  loadingComments: Set<number>;
  getValidChildrenCount: (commentId: number) => number;
}

export const Comment = ({
  comment,
  isSelected,
  availableWidth,
  expandedComments,
  loadingComments,
  getValidChildrenCount
}: CommentProps) => {
  if (comment.deleted || comment.dead) return null;

  const indent = (comment.depth || 0) * 3;
  const effectiveWidth = availableWidth - indent - 2;
  const validChildrenCount = getValidChildrenCount(comment.id);
  const hasKids = comment.kids && comment.kids.length > 0;
  const hasValidChildren = validChildrenCount > 0;
  const hasDeletedReplies = hasKids && !hasValidChildren;


  const getReplyStatus = () => {
    if (loadingComments.has(comment.id)) {
      return ` • Loading comments...`;
    }

    if (hasDeletedReplies) {
      const deletedCount = comment.kids!.length;
      return ` • ${deletedCount === 1 ? 'Reply deleted' : `${deletedCount} replies deleted`}`;
    }

    if (hasValidChildren) {
      const isExpanded = expandedComments.has(comment.id);
      const action = isExpanded ? 'collapse' : 'expand';
      const noun = validChildrenCount === 1 ? 'reply' : 'replies';
      return ` • [Enter: ${action} ${validChildrenCount} ${noun}]`;
    }

    return '';
  };

  return (
    <box
      paddingLeft={1 + indent}
      paddingRight={1}
      backgroundColor={isSelected ? theme.bg.selected : theme.bg.secondary}
      borderColor={isSelected ? theme.border.focused : theme.border.secondary}
    >
      <box flexDirection="column" width="100%">
        <text>
          {styled.tertiary(
            wrapText(
              `${comment.by} • ${formatTimeAgo(comment.time)}${getReplyStatus()}`,
              effectiveWidth
            )
          )}
        </text>
        {comment.text && (() => {
          const processedText = stripHtml(comment.text);
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const parts = processedText.split(urlRegex);

          return (
            <box flexDirection="column">
              {parts.map((part, index) => (
                part && (
                  <text key={index}>
                    {urlRegex.test(part)
                      ? styled.link(wrapText(part, effectiveWidth))
                      : styled.primary(wrapText(part, effectiveWidth))
                    }
                  </text>
                )
              ))}
            </box>
          );
        })()}
      </box>
    </box>
  );
};