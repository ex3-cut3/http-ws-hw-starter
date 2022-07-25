import {Comment} from './models/comment';
import { USERNAMES_TERM, templateTerm} from './info/texts';

class CommentsProxy {      //proxy - update message with all needed info (for example: username)

  makeComment(comment: Comment) {
    const { message, data }: Comment = comment;
    let resultMessage = '';
    Object.keys(data).forEach((key: string) => {
      if (this.replaceableTermExist(message, key)) {
        resultMessage = message.replace(templateTerm(key), data[key]);
      }
    });
    return resultMessage;
  }

  makeCommentMultipleUsers(comment: Comment, usernames: string[]) {
    const joinedUsers: string = usernames.join(', ').trimEnd();
    return comment.message.replace(templateTerm(USERNAMES_TERM), joinedUsers);
  }

  private replaceableTermExist(message: string, key: string) {
    return message.includes(templateTerm(key));
  }
}

export default CommentsProxy;