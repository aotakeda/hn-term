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
}

export const Comment = ({
  comment,
  isSelected,
  availableWidth,
  expandedComments,
  loadingComments
}: CommentProps) => {
  if (comment.deleted || comment.dead) return null;

  const indent = (comment.depth || 0) * 3;
  const effectiveWidth = availableWidth - indent - 2;

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
              `${comment.by} • ${formatTimeAgo(comment.time)}${
                comment.kids && comment.kids.length > 0
                  ? (loadingComments.has(comment.id)
                      ? ` • Loading comments...`
                      : (expandedComments.has(comment.id)
                          ? ` • [Enter: collapse ${comment.kids.length} replies]`
                          : ` • [Enter: expand ${comment.kids.length} replies]`))
                  : ''
              }`,
              effectiveWidth
            )
          )}
        </text>
        {comment.text && (
          <text>
            {styled.primary(
              wrapText(
                stripHtml(comment.text),
                effectiveWidth
              )
            )}
          </text>
        )}
      </box>
    </box>
  );
};