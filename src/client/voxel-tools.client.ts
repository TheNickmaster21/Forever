import { CrochetClient } from '@rbxts/crochet';
import { WorkspacePosition, workspacePositionToChunkOffset, workspacePositionToChunkPosition } from 'shared/chunk';
import { BlockChangeRequestReplicationEvent } from 'shared/events';
import { startCrochetPromise } from './crochet-start';

const UserInputService = game.GetService('UserInputService');

const Camera = game.Workspace.CurrentCamera!;

const replicationEventFunction = CrochetClient.getRemoteEventFunction(BlockChangeRequestReplicationEvent);

startCrochetPromise.await();

function clickAt(screenPos: Vector3) {
    const ray = Camera.ViewportPointToRay(screenPos.X, screenPos.Y);
    const rayResult = game.Workspace.Raycast(ray.Origin, ray.Direction.mul(50));

    const hit = rayResult?.Instance;
    if (hit) {
        print('hit');
        if (hit.Parent?.Parent?.Name === 'Chunks') {
            const position = hit.Position as WorkspacePosition;
            print(workspacePositionToChunkPosition(position), workspacePositionToChunkOffset(position));

            replicationEventFunction(
                workspacePositionToChunkPosition(position),
                workspacePositionToChunkOffset(position),
                0
            );
        }
    }

    print(rayResult);
}

UserInputService.InputEnded.Connect((input, gameProcessedEvent) => {
    if (gameProcessedEvent) {
        return;
    }

    // Left Click
    if (input.UserInputType === Enum.UserInputType.MouseButton1) {
        clickAt(input.Position);

        // Tap
    } else if (input.UserInputType === Enum.UserInputType.Touch) {
        clickAt(input.Position);

        // Gamepad1 A
    } else if (input.UserInputType === Enum.UserInputType.Gamepad1 && input.KeyCode === Enum.KeyCode.A) {
        clickAt(input.Position);
    }
});
